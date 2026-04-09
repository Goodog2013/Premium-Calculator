namespace GreatCalcInstaller;

internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();

        var appArgs = InstallerArguments.Parse(args);

        if (appArgs.Mode == InstallerMode.Uninstall)
        {
            UninstallRunner.Run(appArgs);
            return;
        }

        Application.Run(new InstallerForm());
    }
}
