using System.Diagnostics;
using System.Reflection;
using Microsoft.Win32;

namespace GreatCalcInstaller;

internal static class InstallerMetadata
{
    public const string ProductName = "GreatCalc";
    public const string CompanyName = "GreatCalc Team";
    public const string PayloadResourceName = "GreatCalcInstaller.Payload.greatcalc.exe";
    public const string LicenseResourceName = "GreatCalcInstaller.Assets.LICENSE.txt";
    public const string UninstallRegistryPath = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GreatCalc";
    public const string InstalledExeName = "greatcalc.exe";
    public const string UninstallerExeName = "GreatCalcUninstaller.exe";

    public static string Version
    {
        get
        {
            var current = Environment.ProcessPath;
            if (string.IsNullOrWhiteSpace(current))
            {
                return "0.1.0";
            }

            var fileVersion = FileVersionInfo.GetVersionInfo(current).ProductVersion;
            return string.IsNullOrWhiteSpace(fileVersion) ? "0.1.0" : fileVersion;
        }
    }

    public static string DefaultInstallPath =>
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), ProductName);
}

internal sealed record InstallOptions(
    string InstallPath,
    bool CreateDesktopShortcut,
    bool CreateStartMenuShortcut);

internal sealed record InstallProgress(int Percent, string Message);

internal static class InstallerService
{
    public static string ReadLicenseText()
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(InstallerMetadata.LicenseResourceName);
        if (stream is null)
        {
            return "License text not found.";
        }

        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    public static void Install(InstallOptions options, IProgress<InstallProgress> progress)
    {
        var installPath = NormalizeInstallPath(options.InstallPath);

        progress.Report(new InstallProgress(4, "Checking running app instances..."));
        StopGreatCalcProcesses();

        progress.Report(new InstallProgress(12, "Preparing installation directory..."));
        Directory.CreateDirectory(installPath);

        progress.Report(new InstallProgress(35, "Deploying application files..."));
        WriteEmbeddedPayload(installPath);

        var installedExePath = Path.Combine(installPath, InstallerMetadata.InstalledExeName);
        var uninstallerPath = Path.Combine(installPath, InstallerMetadata.UninstallerExeName);

        progress.Report(new InstallProgress(50, "Writing uninstaller..."));
        var currentInstallerPath = Environment.ProcessPath
            ?? throw new InvalidOperationException("Cannot resolve installer executable path.");
        File.Copy(currentInstallerPath, uninstallerPath, overwrite: true);

        progress.Report(new InstallProgress(62, "Saving license copy..."));
        File.WriteAllText(Path.Combine(installPath, "LICENSE.txt"), ReadLicenseText());

        progress.Report(new InstallProgress(72, "Creating shortcuts..."));
        if (options.CreateStartMenuShortcut)
        {
            var startMenuPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.Programs),
                $"{InstallerMetadata.ProductName}.lnk");

            CreateShortcut(startMenuPath, installedExePath, installPath, InstallerMetadata.ProductName, string.Empty);
        }

        if (options.CreateDesktopShortcut)
        {
            var desktopPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
                $"{InstallerMetadata.ProductName}.lnk");

            CreateShortcut(desktopPath, installedExePath, installPath, InstallerMetadata.ProductName, string.Empty);
        }

        progress.Report(new InstallProgress(100, "Portable installation completed."));
    }

    private static string NormalizeInstallPath(string rawPath)
    {
        if (string.IsNullOrWhiteSpace(rawPath))
        {
            throw new InvalidOperationException("Install path is required.");
        }

        var full = Path.GetFullPath(rawPath.Trim());

        if (Path.GetPathRoot(full)?.Equals(full, StringComparison.OrdinalIgnoreCase) == true)
        {
            throw new InvalidOperationException("Installing to drive root is not allowed.");
        }

        return full;
    }

    private static void StopGreatCalcProcesses()
    {
        foreach (var process in Process.GetProcessesByName("greatcalc"))
        {
            try
            {
                process.Kill(entireProcessTree: true);
            }
            catch
            {
                // Ignore process shutdown failures.
            }
            finally
            {
                process.Dispose();
            }
        }
    }

    private static void WriteEmbeddedPayload(string installPath)
    {
        var destination = Path.Combine(installPath, InstallerMetadata.InstalledExeName);

        using var payloadStream = OpenPayloadStream();
        using var file = File.Create(destination);
        payloadStream.CopyTo(file);
    }

    private static Stream OpenPayloadStream()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var embedded = assembly.GetManifestResourceStream(InstallerMetadata.PayloadResourceName);
        if (embedded is not null)
        {
            return embedded;
        }

        var fallback = Path.Combine(AppContext.BaseDirectory, "payload", InstallerMetadata.InstalledExeName);
        if (File.Exists(fallback))
        {
            return File.OpenRead(fallback);
        }

        throw new FileNotFoundException("Embedded payload not found.");
    }

    private static void CreateShortcut(
        string shortcutPath,
        string targetPath,
        string workingDirectory,
        string description,
        string arguments)
    {
        var shortcutDirectory = Path.GetDirectoryName(shortcutPath);
        if (!string.IsNullOrWhiteSpace(shortcutDirectory))
        {
            Directory.CreateDirectory(shortcutDirectory);
        }

        var shellType = Type.GetTypeFromProgID("WScript.Shell")
            ?? throw new InvalidOperationException("WScript.Shell COM type is unavailable.");

        dynamic? shell = null;
        dynamic? shortcut = null;

        try
        {
            shell = Activator.CreateInstance(shellType);
            shortcut = shell!.CreateShortcut(shortcutPath);
            shortcut.TargetPath = targetPath;
            shortcut.WorkingDirectory = workingDirectory;
            shortcut.Description = description;
            shortcut.Arguments = arguments;
            shortcut.IconLocation = targetPath + ",0";
            shortcut.Save();
        }
        finally
        {
            if (shortcut is not null)
            {
                System.Runtime.InteropServices.Marshal.FinalReleaseComObject(shortcut);
            }

            if (shell is not null)
            {
                System.Runtime.InteropServices.Marshal.FinalReleaseComObject(shell);
            }
        }
    }

    private static void RegisterUninstallEntry(string installPath, string installedExePath, string uninstallerPath)
    {
        using var key = Registry.CurrentUser.CreateSubKey(InstallerMetadata.UninstallRegistryPath, writable: true)
            ?? throw new InvalidOperationException("Unable to write uninstall registry entry.");

        var uninstallCommand = $"\"{uninstallerPath}\" --uninstall --target \"{installPath}\"";

        key.SetValue("DisplayName", InstallerMetadata.ProductName, RegistryValueKind.String);
        key.SetValue("DisplayVersion", InstallerMetadata.Version, RegistryValueKind.String);
        key.SetValue("Publisher", InstallerMetadata.CompanyName, RegistryValueKind.String);
        key.SetValue("InstallLocation", installPath, RegistryValueKind.String);
        key.SetValue("DisplayIcon", installedExePath, RegistryValueKind.String);
        key.SetValue("UninstallString", uninstallCommand, RegistryValueKind.String);
        key.SetValue("QuietUninstallString", uninstallCommand + " --silent", RegistryValueKind.String);
        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
        key.SetValue("InstallDate", DateTime.Now.ToString("yyyyMMdd"), RegistryValueKind.String);

        var sizeKb = 0;
        try
        {
            sizeKb = Convert.ToInt32(new FileInfo(installedExePath).Length / 1024L);
        }
        catch
        {
            // ignore size computation errors
        }

        if (sizeKb > 0)
        {
            key.SetValue("EstimatedSize", sizeKb, RegistryValueKind.DWord);
        }
    }
}

internal static class UninstallRunner
{
    public static void Run(InstallerArguments args)
    {
        var targetPath = ResolveTargetPath(args.TargetPath);

        if (!args.Silent)
        {
            var confirm = MessageBox.Show(
                $"Remove {InstallerMetadata.ProductName} from:\n{targetPath}?",
                "GreatCalc Uninstaller",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question,
                MessageBoxDefaultButton.Button2);

            if (confirm != DialogResult.Yes)
            {
                return;
            }
        }

        try
        {
            UninstallService.Uninstall(targetPath);

            if (!args.Silent)
            {
                MessageBox.Show(
                    "GreatCalc has been removed.",
                    "GreatCalc Uninstaller",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
        }
        catch (Exception ex)
        {
            if (args.Silent)
            {
                return;
            }

            MessageBox.Show(
                "Uninstall failed:\n" + ex.Message,
                "GreatCalc Uninstaller",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }

    private static string ResolveTargetPath(string? targetFromArgs)
    {
        if (!string.IsNullOrWhiteSpace(targetFromArgs))
        {
            return Path.GetFullPath(targetFromArgs);
        }

        var processPath = Environment.ProcessPath
            ?? throw new InvalidOperationException("Cannot resolve uninstaller path.");

        var folder = Path.GetDirectoryName(processPath)
            ?? throw new InvalidOperationException("Cannot resolve uninstaller directory.");

        return Path.GetFullPath(folder);
    }
}

internal static class UninstallService
{
    public static void Uninstall(string installPath)
    {
        var fullPath = Path.GetFullPath(installPath);
        EnsureSafePath(fullPath);

        foreach (var process in Process.GetProcessesByName("greatcalc"))
        {
            try
            {
                process.Kill(entireProcessTree: true);
            }
            catch
            {
                // Ignore process stop failures.
            }
            finally
            {
                process.Dispose();
            }
        }

        TryDeleteFile(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), $"{InstallerMetadata.ProductName}.lnk"));
        TryDeleteFile(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), $"{InstallerMetadata.ProductName}.lnk"));

        try
        {
            Registry.CurrentUser.DeleteSubKeyTree(InstallerMetadata.UninstallRegistryPath, throwOnMissingSubKey: false);
        }
        catch
        {
            // Ignore registry cleanup failures.
        }

        ScheduleDirectoryDeletion(fullPath);
    }

    private static void EnsureSafePath(string fullPath)
    {
        var programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        var programFilesX86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);

        var safe = fullPath.Contains("greatcalc", StringComparison.OrdinalIgnoreCase)
            || fullPath.StartsWith(programFiles, StringComparison.OrdinalIgnoreCase)
            || fullPath.StartsWith(programFilesX86, StringComparison.OrdinalIgnoreCase);

        if (!safe)
        {
            throw new InvalidOperationException("Refusing to remove an unexpected target path.");
        }
    }

    private static void TryDeleteFile(string path)
    {
        try
        {
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }
        catch
        {
            // Ignore shortcut deletion failures.
        }
    }

    private static void ScheduleDirectoryDeletion(string fullPath)
    {
        var tempScript = Path.Combine(Path.GetTempPath(), $"greatcalc-uninstall-{Guid.NewGuid():N}.cmd");

        var script = string.Join(
            Environment.NewLine,
            "@echo off",
            "ping 127.0.0.1 -n 3 > nul",
            $"rmdir /s /q \"{fullPath}\"",
            "del /f /q \"%~f0\"");

        File.WriteAllText(tempScript, script);

        var startInfo = new ProcessStartInfo
        {
            FileName = "cmd.exe",
            Arguments = $"/c \"{tempScript}\"",
            CreateNoWindow = true,
            UseShellExecute = false,
            WindowStyle = ProcessWindowStyle.Hidden,
        };

        Process.Start(startInfo);
    }
}
