namespace GreatCalcInstaller;

internal enum InstallerMode
{
    Install,
    Uninstall,
}

internal sealed record InstallerArguments(
    InstallerMode Mode,
    string? TargetPath,
    bool Silent)
{
    public static InstallerArguments Parse(string[] args)
    {
        var mode = InstallerMode.Install;
        string? targetPath = null;
        var silent = false;

        for (var i = 0; i < args.Length; i += 1)
        {
            var current = args[i].Trim();

            if (current.Equals("--uninstall", StringComparison.OrdinalIgnoreCase))
            {
                mode = InstallerMode.Uninstall;
                continue;
            }

            if (current.Equals("--silent", StringComparison.OrdinalIgnoreCase))
            {
                silent = true;
                continue;
            }

            if (current.Equals("--target", StringComparison.OrdinalIgnoreCase))
            {
                if (i + 1 < args.Length)
                {
                    targetPath = args[i + 1];
                    i += 1;
                }
            }
        }

        return new InstallerArguments(mode, targetPath, silent);
    }
}
