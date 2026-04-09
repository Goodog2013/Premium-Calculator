using System.Drawing.Drawing2D;

namespace GreatCalcInstaller;

internal sealed class InstallerForm : Form
{
    private readonly TextBox _installPathBox = new();
    private readonly CheckBox _desktopShortcutCheck = new();
    private readonly CheckBox _startMenuShortcutCheck = new();
    private readonly RichTextBox _licenseBox = new();
    private readonly CheckBox _acceptLicenseCheck = new();
    private readonly Button _installButton = new();
    private readonly Button _cancelButton = new();
    private readonly ProgressBar _progressBar = new();
    private readonly Label _statusLabel = new();
    private readonly Button _browseButton = new();

    public InstallerForm()
    {
        SuspendLayout();

        Text = "GreatCalc Portable Setup";
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;
        MinimizeBox = false;
        ClientSize = new Size(980, 640);
        BackColor = Color.FromArgb(15, 23, 42);
        ForeColor = Color.White;

        BuildLayout();
        BindEvents();

        ResumeLayout(false);
    }

    private void BuildLayout()
    {
        var leftPanel = new Panel
        {
            Dock = DockStyle.Left,
            Width = 300,
        };
        leftPanel.Paint += (_, args) => PaintHeroPanel(args.Graphics, leftPanel.ClientRectangle);

        var rightPanel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.FromArgb(248, 250, 252),
            Padding = new Padding(28, 20, 28, 20),
        };

        var titleLabel = new Label
        {
            Text = "Install GreatCalc (Portable)",
            Font = new Font("Segoe UI", 18, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            AutoSize = true,
            Location = new Point(0, 0),
        };

        var subtitleLabel = new Label
        {
            Text = "Portable install, custom folder, no admin rights required",
            Font = new Font("Segoe UI", 10, FontStyle.Regular),
            ForeColor = Color.FromArgb(71, 85, 105),
            AutoSize = true,
            Location = new Point(0, 38),
        };

        var pathLabel = new Label
        {
            Text = "Install folder",
            Font = new Font("Segoe UI", 10, FontStyle.Bold),
            ForeColor = Color.FromArgb(30, 41, 59),
            AutoSize = true,
            Location = new Point(0, 84),
        };

        _installPathBox.Location = new Point(0, 110);
        _installPathBox.Size = new Size(540, 32);
        _installPathBox.Font = new Font("Segoe UI", 10, FontStyle.Regular);
        _installPathBox.BorderStyle = BorderStyle.FixedSingle;
        _installPathBox.Text = InstallerMetadata.DefaultInstallPath;

        _browseButton.Text = "Browse";
        _browseButton.Location = new Point(550, 108);
        _browseButton.Size = new Size(100, 36);
        StyleGhostButton(_browseButton);

        var optionsLabel = new Label
        {
            Text = "Shortcuts",
            Font = new Font("Segoe UI", 10, FontStyle.Bold),
            ForeColor = Color.FromArgb(30, 41, 59),
            AutoSize = true,
            Location = new Point(0, 164),
        };

        _desktopShortcutCheck.Text = "Create Desktop shortcut";
        _desktopShortcutCheck.AutoSize = true;
        _desktopShortcutCheck.Location = new Point(0, 192);
        _desktopShortcutCheck.Checked = true;
        _desktopShortcutCheck.ForeColor = Color.FromArgb(15, 23, 42);
        _desktopShortcutCheck.Font = new Font("Segoe UI", 9, FontStyle.Regular);

        _startMenuShortcutCheck.Text = "Create Start Menu shortcut";
        _startMenuShortcutCheck.AutoSize = true;
        _startMenuShortcutCheck.Location = new Point(220, 192);
        _startMenuShortcutCheck.Checked = true;
        _startMenuShortcutCheck.ForeColor = Color.FromArgb(15, 23, 42);
        _startMenuShortcutCheck.Font = new Font("Segoe UI", 9, FontStyle.Regular);

        var licenseLabel = new Label
        {
            Text = "License agreement",
            Font = new Font("Segoe UI", 10, FontStyle.Bold),
            ForeColor = Color.FromArgb(30, 41, 59),
            AutoSize = true,
            Location = new Point(0, 230),
        };

        _licenseBox.Location = new Point(0, 258);
        _licenseBox.Size = new Size(650, 250);
        _licenseBox.ReadOnly = true;
        _licenseBox.BorderStyle = BorderStyle.FixedSingle;
        _licenseBox.BackColor = Color.White;
        _licenseBox.ForeColor = Color.FromArgb(30, 41, 59);
        _licenseBox.Font = new Font("Cascadia Code", 9, FontStyle.Regular);
        _licenseBox.Text = InstallerService.ReadLicenseText();

        _acceptLicenseCheck.Text = "I accept the license terms";
        _acceptLicenseCheck.AutoSize = true;
        _acceptLicenseCheck.Location = new Point(0, 520);
        _acceptLicenseCheck.ForeColor = Color.FromArgb(15, 23, 42);
        _acceptLicenseCheck.Font = new Font("Segoe UI", 9, FontStyle.Bold);

        _statusLabel.Text = "Ready to install";
        _statusLabel.AutoSize = true;
        _statusLabel.Location = new Point(0, 550);
        _statusLabel.Font = new Font("Segoe UI", 9, FontStyle.Regular);
        _statusLabel.ForeColor = Color.FromArgb(71, 85, 105);

        _progressBar.Location = new Point(0, 572);
        _progressBar.Size = new Size(430, 14);

        _installButton.Text = "Install";
        _installButton.Location = new Point(450, 562);
        _installButton.Size = new Size(96, 36);
        _installButton.Enabled = false;
        StylePrimaryButton(_installButton);

        _cancelButton.Text = "Cancel";
        _cancelButton.Location = new Point(554, 562);
        _cancelButton.Size = new Size(96, 36);
        StyleGhostButton(_cancelButton);

        rightPanel.Controls.Add(titleLabel);
        rightPanel.Controls.Add(subtitleLabel);
        rightPanel.Controls.Add(pathLabel);
        rightPanel.Controls.Add(_installPathBox);
        rightPanel.Controls.Add(_browseButton);
        rightPanel.Controls.Add(optionsLabel);
        rightPanel.Controls.Add(_desktopShortcutCheck);
        rightPanel.Controls.Add(_startMenuShortcutCheck);
        rightPanel.Controls.Add(licenseLabel);
        rightPanel.Controls.Add(_licenseBox);
        rightPanel.Controls.Add(_acceptLicenseCheck);
        rightPanel.Controls.Add(_statusLabel);
        rightPanel.Controls.Add(_progressBar);
        rightPanel.Controls.Add(_installButton);
        rightPanel.Controls.Add(_cancelButton);

        Controls.Add(rightPanel);
        Controls.Add(leftPanel);
    }

    private void BindEvents()
    {
        _browseButton.Click += (_, _) => SelectInstallFolder();
        _acceptLicenseCheck.CheckedChanged += (_, _) => _installButton.Enabled = _acceptLicenseCheck.Checked;
        _cancelButton.Click += (_, _) => Close();
        _installButton.Click += async (_, _) => await InstallAsync();
    }

    private void SelectInstallFolder()
    {
        using var dialog = new FolderBrowserDialog
        {
            Description = "Select installation folder",
            UseDescriptionForTitle = true,
            ShowNewFolderButton = true,
            InitialDirectory = _installPathBox.Text,
        };

        if (dialog.ShowDialog(this) == DialogResult.OK)
        {
            _installPathBox.Text = dialog.SelectedPath;
        }
    }

    private async Task InstallAsync()
    {
        ToggleInputs(false);

        var progress = new Progress<InstallProgress>(state =>
        {
            _progressBar.Value = Math.Clamp(state.Percent, 0, 100);
            _statusLabel.Text = state.Message;
        });

        try
        {
            var options = new InstallOptions(
                _installPathBox.Text,
                _desktopShortcutCheck.Checked,
                _startMenuShortcutCheck.Checked);

            await Task.Run(() => InstallerService.Install(options, progress));

            MessageBox.Show(
                this,
                "GreatCalc was installed successfully.",
                "Portable Installation Complete",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);

            Close();
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                this,
                "Installation failed:\n" + ex.Message,
                "Installer Error",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);

            _statusLabel.Text = "Installation failed.";
        }
        finally
        {
            ToggleInputs(true);
            _installButton.Enabled = _acceptLicenseCheck.Checked;
        }
    }

    private void ToggleInputs(bool enabled)
    {
        _browseButton.Enabled = enabled;
        _installPathBox.Enabled = enabled;
        _desktopShortcutCheck.Enabled = enabled;
        _startMenuShortcutCheck.Enabled = enabled;
        _acceptLicenseCheck.Enabled = enabled;
        _cancelButton.Enabled = enabled;
        _installButton.Enabled = enabled;
    }

    private static void PaintHeroPanel(Graphics graphics, Rectangle bounds)
    {
        using var gradient = new LinearGradientBrush(
            bounds,
            Color.FromArgb(6, 182, 212),
            Color.FromArgb(14, 116, 144),
            LinearGradientMode.Vertical);

        graphics.FillRectangle(gradient, bounds);

        using var softCircleBrush = new SolidBrush(Color.FromArgb(55, 255, 255, 255));
        graphics.FillEllipse(softCircleBrush, new Rectangle(30, 90, 220, 220));
        graphics.FillEllipse(softCircleBrush, new Rectangle(120, 260, 180, 180));

        using var titleBrush = new SolidBrush(Color.White);
        graphics.DrawString(
            "GreatCalc",
            new Font("Segoe UI", 26, FontStyle.Bold),
            titleBrush,
            new PointF(28, 28));

        graphics.DrawString(
            "Portable Installer",
            new Font("Segoe UI", 12, FontStyle.Regular),
            titleBrush,
            new PointF(32, 74));

        using var cardBrush = new SolidBrush(Color.FromArgb(100, 3, 7, 18));
        var cardRect = new Rectangle(32, bounds.Height - 205, bounds.Width - 64, 162);
        using var cardPath = RoundedRect(cardRect, 20);
        graphics.FillPath(cardBrush, cardPath);

        graphics.DrawString(
            "Features",
            new Font("Segoe UI", 11, FontStyle.Bold),
            Brushes.White,
            new PointF(52, bounds.Height - 180));

        graphics.DrawString(
            "- Portable install\n- No admin rights\n- Custom path + shortcuts\n- Premium calculator UI",
            new Font("Segoe UI", 10, FontStyle.Regular),
            Brushes.White,
            new PointF(52, bounds.Height - 148));
    }

    private static GraphicsPath RoundedRect(Rectangle bounds, int radius)
    {
        var path = new GraphicsPath();
        var d = radius * 2;

        path.StartFigure();
        path.AddArc(bounds.X, bounds.Y, d, d, 180, 90);
        path.AddArc(bounds.Right - d, bounds.Y, d, d, 270, 90);
        path.AddArc(bounds.Right - d, bounds.Bottom - d, d, d, 0, 90);
        path.AddArc(bounds.X, bounds.Bottom - d, d, d, 90, 90);
        path.CloseFigure();

        return path;
    }

    private static void StylePrimaryButton(Button button)
    {
        button.FlatStyle = FlatStyle.Flat;
        button.FlatAppearance.BorderSize = 0;
        button.BackColor = Color.FromArgb(6, 182, 212);
        button.ForeColor = Color.White;
        button.Font = new Font("Segoe UI", 10, FontStyle.Bold);
    }

    private static void StyleGhostButton(Button button)
    {
        button.FlatStyle = FlatStyle.Flat;
        button.FlatAppearance.BorderSize = 1;
        button.FlatAppearance.BorderColor = Color.FromArgb(148, 163, 184);
        button.BackColor = Color.White;
        button.ForeColor = Color.FromArgb(30, 41, 59);
        button.Font = new Font("Segoe UI", 10, FontStyle.Regular);
    }
}
