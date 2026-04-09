using System.Diagnostics;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;

namespace GreatCalcInstaller;

internal sealed class InstallerForm : Form
{
    private readonly FxPanel _titleBar = new();
    private readonly FxPanel _heroPanel = new();
    private readonly FxPanel _contentPanel = new();
    private readonly FxPanel _pathCard = new();
    private readonly FxPanel _optionsCard = new();
    private readonly FxPanel _licenseCard = new();
    private readonly FxPanel _actionsCard = new();
    private readonly FxPanel _pathShell = new();
    private readonly FxPanel _licenseShell = new();
    private readonly FxPanel _progressPanel = new();

    private readonly Label _titleLabel = new();
    private readonly Label _titleModeLabel = new();
    private readonly Label _headerLabel = new();
    private readonly Label _subHeaderLabel = new();
    private readonly Label _statusLabel = new();

    private readonly TextBox _installPathBox = new();
    private readonly RichTextBox _licenseBox = new();
    private readonly CheckBox _desktopShortcutCheck = new();
    private readonly CheckBox _startMenuShortcutCheck = new();
    private readonly CheckBox _acceptLicenseCheck = new();

    private readonly FxButton _browseButton = new();
    private readonly FxButton _installButton = new();
    private readonly FxButton _cancelButton = new();
    private readonly FxButton _closeButton = new();
    private readonly FxButton _minimizeButton = new();
    private readonly FxButton _languageButton = new();

    private readonly System.Windows.Forms.Timer _timer = new() { Interval = 16 };
    private readonly Stopwatch _clock = Stopwatch.StartNew();
    private readonly Dictionary<FxButton, ButtonAnim> _buttonAnims = new();

    private readonly Orb[] _orbs =
    {
        new(0.23f, 0.20f, 152f, 26f, 22f, 0.72f, 0.1f, Color.FromArgb(34, 211, 238), 76),
        new(0.72f, 0.32f, 120f, 22f, 16f, 0.58f, 1.2f, Color.FromArgb(56, 189, 248), 66),
        new(0.44f, 0.60f, 140f, 16f, 13f, 0.64f, 2.3f, Color.FromArgb(14, 165, 233), 60),
        new(0.82f, 0.78f, 108f, 24f, 20f, 0.67f, 0.7f, Color.FromArgb(103, 232, 249), 56),
    };

    private readonly Font _heroTitleFont = new("Segoe UI Semibold", 28f, FontStyle.Bold);
    private readonly Font _heroSubFont = new("Segoe UI", 11f, FontStyle.Regular);
    private readonly Font _heroBodyFont = new("Segoe UI", 10f, FontStyle.Regular);
    private readonly Font _heroCodeFont = new("Cascadia Mono", 9f, FontStyle.Regular);

    private static readonly UiCopy EnUi = new(
        "GreatCalc Portable Setup",
        "Premium Installer",
        "Install GreatCalc",
        "Portable setup with custom folder, shortcuts and polished flow.",
        "Install folder",
        "Pick any custom path for your portable bundle.",
        "Browse",
        "Shortcuts",
        "Choose where launch shortcuts should be created.",
        "Create Desktop shortcut",
        "Create Start Menu shortcut",
        "License agreement",
        "Review terms before installation.",
        "I accept the license terms",
        "Ready to install",
        "Install",
        "Cancel",
        "EN / RU",
        "Select installation folder",
        "Starting installation...",
        "Installation completed successfully.",
        "Installation failed.",
        "GreatCalc was installed successfully.",
        "Portable Installation Complete",
        "Installer Error",
        "Portable setup engine",
        "What you get",
        "- one portable executable",
        "- custom install path and shortcuts",
        "- user-level install, no admin",
        "- integrated uninstaller");

    private static readonly UiCopy RuUi = new(
        "Установка GreatCalc Portable",
        "Премиум-установщик",
        "Установка GreatCalc",
        "Портативная установка с выбором папки, ярлыков и аккуратным UX.",
        "Папка установки",
        "Выберите любую удобную папку для портативной версии.",
        "Обзор",
        "Ярлыки",
        "Выберите, где создать ярлыки запуска.",
        "Создать ярлык на рабочем столе",
        "Создать ярлык в меню Пуск",
        "Лицензионное соглашение",
        "Перед установкой ознакомьтесь с условиями.",
        "Я принимаю условия лицензии",
        "Готово к установке",
        "Установить",
        "Отмена",
        "EN / RU",
        "Выберите папку установки",
        "Запуск установки...",
        "Установка успешно завершена.",
        "Ошибка установки.",
        "GreatCalc успешно установлен.",
        "Установка завершена",
        "Ошибка установщика",
        "Портативный установщик",
        "Что вы получаете",
        "- один портативный исполняемый файл",
        "- произвольный путь и ярлыки",
        "- установка без прав администратора",
        "- встроенный деинсталлятор");

    private float _time;
    private float _pathGlow;
    private float _progressShimmer;
    private float _languageSwitchProgress;
    private bool _pathFocused;
    private bool _isInstalling;
    private int _progressPercent;
    private UiLanguage _language = UiLanguage.En;

    public InstallerForm()
    {
        SuspendLayout();

        Text = "GreatCalc Portable Setup";
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.None;
        MinimizeBox = true;
        MaximizeBox = false;
        ClientSize = new Size(1360, 860);
        MinimumSize = new Size(1200, 760);
        BackColor = Color.FromArgb(2, 9, 21);
        ForeColor = Color.White;
        Padding = new Padding(1);
        Opacity = 0d;
        DoubleBuffered = true;

        BuildUi();
        BindEvents();
        LayoutUi();
        UpdateInstallButtonState();

        _timer.Start();

        ResumeLayout(false);
    }

    protected override CreateParams CreateParams
    {
        get
        {
            const int DropShadow = 0x00020000;
            var cp = base.CreateParams;
            cp.ClassStyle |= DropShadow;
            return cp;
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _timer.Dispose();
            _heroTitleFont.Dispose();
            _heroSubFont.Dispose();
            _heroBodyFont.Dispose();
            _heroCodeFont.Dispose();
        }

        base.Dispose(disposing);
    }

    private void BuildUi()
    {
        _titleBar.Height = 54;
        _titleBar.Dock = DockStyle.Top;
        _titleBar.Paint += (_, e) => PaintTitleBar(e.Graphics, _titleBar.ClientRectangle);

        _titleLabel.Text = "GreatCalc";
        _titleLabel.AutoSize = true;
        _titleLabel.Font = new Font("Segoe UI Semibold", 11f, FontStyle.Bold);
        _titleLabel.ForeColor = Color.FromArgb(241, 245, 249);

        _titleModeLabel.Text = EnUi.TitleMode;
        _titleModeLabel.AutoSize = true;
        _titleModeLabel.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        _titleModeLabel.ForeColor = Color.FromArgb(148, 163, 184);

        _minimizeButton.Text = "_";
        _closeButton.Text = "X";
        _languageButton.Text = EnUi.LanguageToggle;
        SetupButton(_minimizeButton, new ButtonTheme(Color.FromArgb(7, 18, 34), Color.FromArgb(18, 32, 54), Color.FromArgb(9, 20, 34), Color.FromArgb(51, 65, 85), Color.FromArgb(148, 163, 184), Color.FromArgb(203, 213, 225)), 11);
        SetupButton(_closeButton, new ButtonTheme(Color.FromArgb(7, 18, 34), Color.FromArgb(127, 29, 29), Color.FromArgb(153, 27, 27), Color.FromArgb(51, 65, 85), Color.FromArgb(248, 113, 113), Color.FromArgb(254, 242, 242)), 11);
        SetupButton(_languageButton, new ButtonTheme(Color.FromArgb(8, 18, 34), Color.FromArgb(18, 32, 54), Color.FromArgb(10, 22, 41), Color.FromArgb(56, 189, 248), Color.FromArgb(125, 211, 252), Color.FromArgb(226, 232, 240)), 14);
        _languageButton.IsLanguageToggle = true;
        _languageButton.LanguageProgress = _languageSwitchProgress;

        _titleBar.Controls.AddRange(new Control[] { _titleLabel, _titleModeLabel, _languageButton, _minimizeButton, _closeButton });

        _heroPanel.Paint += (_, e) => PaintHero(e.Graphics, _heroPanel.ClientRectangle);

        _contentPanel.BackColor = Color.Transparent;
        _headerLabel.Text = EnUi.HeaderTitle;
        _headerLabel.AutoSize = true;
        _headerLabel.Font = new Font("Segoe UI Semibold", 24f, FontStyle.Bold);
        _headerLabel.ForeColor = Color.FromArgb(241, 245, 249);

        _subHeaderLabel.Text = EnUi.HeaderSubtitle;
        _subHeaderLabel.AutoSize = true;
        _subHeaderLabel.Font = new Font("Segoe UI", 10f, FontStyle.Regular);
        _subHeaderLabel.ForeColor = Color.FromArgb(148, 163, 184);

        _contentPanel.Controls.AddRange(new Control[] { _headerLabel, _subHeaderLabel, _pathCard, _optionsCard, _licenseCard, _actionsCard });

        SetupCard(_pathCard, Color.FromArgb(17, 31, 55), Color.FromArgb(11, 21, 40), Color.FromArgb(56, 189, 248), 24);
        SetupCard(_optionsCard, Color.FromArgb(15, 28, 50), Color.FromArgb(10, 19, 36), Color.FromArgb(51, 65, 85), 0);
        SetupCard(_licenseCard, Color.FromArgb(14, 27, 48), Color.FromArgb(9, 17, 34), Color.FromArgb(51, 65, 85), 0);
        SetupCard(_actionsCard, Color.FromArgb(18, 32, 56), Color.FromArgb(12, 21, 40), Color.FromArgb(56, 189, 248), 18);

        var pathTitle = SectionTitle(EnUi.PathTitle, EnUi.PathSubtitle);
        _pathCard.Controls.AddRange(pathTitle);

        _pathShell.Paint += (_, e) => PaintPathShell(e.Graphics, _pathShell.ClientRectangle);
        _pathShell.Resize += (_, _) => ApplyRoundRegion(_pathShell, 16);

        _installPathBox.BorderStyle = BorderStyle.None;
        _installPathBox.Font = new Font("Segoe UI", 10.5f, FontStyle.Regular);
        _installPathBox.ForeColor = Color.FromArgb(226, 232, 240);
        _installPathBox.BackColor = Color.FromArgb(8, 17, 34);
        _installPathBox.Text = InstallerMetadata.DefaultInstallPath;
        _pathShell.Controls.Add(_installPathBox);

        _browseButton.Text = EnUi.Browse;
        SetupButton(_browseButton, new ButtonTheme(Color.FromArgb(12, 22, 40), Color.FromArgb(22, 35, 58), Color.FromArgb(10, 17, 32), Color.FromArgb(71, 85, 105), Color.FromArgb(125, 211, 252), Color.FromArgb(226, 232, 240)), 16);
        _pathCard.Controls.AddRange(new Control[] { _pathShell, _browseButton });

        var optionsTitle = SectionTitle(EnUi.OptionsTitle, EnUi.OptionsSubtitle);
        _optionsCard.Controls.AddRange(optionsTitle);

        StyleCheckBox(_desktopShortcutCheck, EnUi.DesktopShortcut, true);
        StyleCheckBox(_startMenuShortcutCheck, EnUi.StartMenuShortcut, true);
        _optionsCard.Controls.AddRange(new Control[] { _desktopShortcutCheck, _startMenuShortcutCheck });

        var licenseTitle = SectionTitle(EnUi.LicenseTitle, EnUi.LicenseSubtitle);
        _licenseCard.Controls.AddRange(licenseTitle);

        _licenseShell.Paint += (_, e) => PaintCard(e.Graphics, _licenseShell.ClientRectangle, Color.FromArgb(9, 18, 34), Color.FromArgb(6, 13, 26), Color.FromArgb(51, 65, 85), 16, 0);
        _licenseShell.Resize += (_, _) => ApplyRoundRegion(_licenseShell, 16);

        _licenseBox.ReadOnly = true;
        _licenseBox.BorderStyle = BorderStyle.None;
        _licenseBox.BackColor = Color.FromArgb(7, 15, 30);
        _licenseBox.ForeColor = Color.FromArgb(203, 213, 225);
        _licenseBox.Font = new Font("Cascadia Code", 9f, FontStyle.Regular);
        _licenseBox.Text = InstallerService.ReadLicenseText();

        _licenseShell.Controls.Add(_licenseBox);
        _licenseCard.Controls.Add(_licenseShell);

        StyleCheckBox(_acceptLicenseCheck, EnUi.AcceptLicense, false);

        _statusLabel.Text = EnUi.ReadyStatus;
        _statusLabel.AutoSize = true;
        _statusLabel.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        _statusLabel.ForeColor = Color.FromArgb(148, 163, 184);

        _progressPanel.Paint += (_, e) => PaintProgress(e.Graphics, _progressPanel.ClientRectangle);
        _progressPanel.Resize += (_, _) => ApplyRoundRegion(_progressPanel, 12);

        _installButton.Text = EnUi.Install;
        _cancelButton.Text = EnUi.Cancel;
        SetupButton(_installButton, new ButtonTheme(Color.FromArgb(14, 165, 233), Color.FromArgb(34, 211, 238), Color.FromArgb(8, 145, 178), Color.FromArgb(56, 189, 248), Color.FromArgb(103, 232, 249), Color.White), 16);
        SetupButton(_cancelButton, new ButtonTheme(Color.FromArgb(12, 22, 40), Color.FromArgb(22, 35, 58), Color.FromArgb(10, 17, 32), Color.FromArgb(71, 85, 105), Color.FromArgb(125, 211, 252), Color.FromArgb(226, 232, 240)), 16);

        _actionsCard.Controls.AddRange(new Control[] { _acceptLicenseCheck, _statusLabel, _progressPanel, _installButton, _cancelButton });

        Controls.Add(_contentPanel);
        Controls.Add(_heroPanel);
        Controls.Add(_titleBar);

        ApplyLanguage();

        AcceptButton = _installButton;
        CancelButton = _cancelButton;
    }

    private Label[] SectionTitle(string title, string subtitle)
    {
        var t = new Label
        {
            Text = title,
            AutoSize = true,
            Font = new Font("Segoe UI Semibold", 10.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(226, 232, 240),
            Location = new Point(20, 12),
            Tag = "title",
        };

        var s = new Label
        {
            Text = subtitle,
            AutoSize = true,
            Font = new Font("Segoe UI", 9f, FontStyle.Regular),
            ForeColor = Color.FromArgb(148, 163, 184),
            Location = new Point(20, 33),
            Tag = "sub",
        };

        return new[] { t, s };
    }

    private void SetupCard(FxPanel panel, Color top, Color bottom, Color border, int glow)
    {
        panel.Paint += (_, e) => PaintCard(e.Graphics, panel.ClientRectangle, top, bottom, border, 24, glow);
        panel.Resize += (_, _) => ApplyRoundRegion(panel, 24);
    }

    private void SetupButton(FxButton button, ButtonTheme theme, int radius = 14)
    {
        button.FlatStyle = FlatStyle.Flat;
        button.FlatAppearance.BorderSize = 0;
        button.BackColor = theme.Base;
        button.BorderColor = theme.Border;
        button.CornerRadius = radius;
        button.ForeColor = theme.Text;
        button.Font = new Font("Segoe UI Semibold", 10f, FontStyle.Bold);
        button.Cursor = Cursors.Hand;
        button.TabStop = false;

        var anim = new ButtonAnim(theme);
        _buttonAnims[button] = anim;

        button.MouseEnter += (_, _) => anim.HoverTarget = true;
        button.MouseLeave += (_, _) => { anim.HoverTarget = false; anim.PressTarget = false; };
        button.MouseDown += (_, a) => { if (a.Button == MouseButtons.Left) anim.PressTarget = true; };
        button.MouseUp += (_, _) => anim.PressTarget = false;
    }

    private static void StyleCheckBox(CheckBox checkBox, string text, bool initial)
    {
        checkBox.Text = text;
        checkBox.Checked = initial;
        checkBox.AutoSize = true;
        checkBox.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        checkBox.ForeColor = Color.FromArgb(226, 232, 240);
        checkBox.BackColor = Color.Transparent;
        checkBox.Cursor = Cursors.Hand;
    }

    private void BindEvents()
    {
        Resize += (_, _) => LayoutUi();

        _titleBar.MouseDown += (_, a) => BeginDrag(a);
        _titleLabel.MouseDown += (_, a) => BeginDrag(a);
        _titleModeLabel.MouseDown += (_, a) => BeginDrag(a);

        _closeButton.Click += (_, _) => Close();
        _minimizeButton.Click += (_, _) => WindowState = FormWindowState.Minimized;
        _languageButton.Click += (_, _) => ToggleLanguage();

        _browseButton.Click += (_, _) => SelectInstallFolder();
        _installButton.Click += async (_, _) => await InstallAsync();
        _cancelButton.Click += (_, _) => Close();
        _acceptLicenseCheck.CheckedChanged += (_, _) => UpdateInstallButtonState();

        _installPathBox.Enter += (_, _) => _pathFocused = true;
        _installPathBox.Leave += (_, _) => _pathFocused = false;

        _timer.Tick += (_, _) => Animate();
    }

    private void LayoutUi()
    {
        ApplyRoundRegion(this, 28);

        _titleLabel.Location = new Point(34, 16);
        _titleModeLabel.Location = new Point(116, 17);

        var right = _titleBar.Width - 12;
        _closeButton.Bounds = new Rectangle(right - 34, 12, 34, 30);
        _minimizeButton.Bounds = new Rectangle(right - 74, 12, 34, 30);
        _languageButton.Bounds = new Rectangle(right - 154, 12, 72, 30);

        var bodyTop = _titleBar.Bottom + 12;
        var body = new Rectangle(14, bodyTop, ClientSize.Width - 28, ClientSize.Height - bodyTop - 14);

        var heroWidth = Math.Clamp((int)(body.Width * 0.31f), 290, 380);
        _heroPanel.Bounds = new Rectangle(body.Left, body.Top, heroWidth, body.Height);
        ApplyRoundRegion(_heroPanel, 30);
        _contentPanel.Bounds = new Rectangle(_heroPanel.Right + 12, body.Top, body.Width - heroWidth - 12, body.Height);

        _headerLabel.Location = new Point(2, 0);
        _subHeaderLabel.Location = new Point(4, 45);

        var y = 78;
        var w = _contentPanel.Width;

        _pathCard.Bounds = new Rectangle(0, y, w, 112);
        y += 124;

        _optionsCard.Bounds = new Rectangle(0, y, w, 84);
        y += 96;

        const int actionsHeight = 126;
        var licenseHeight = Math.Max(140, _contentPanel.Height - y - actionsHeight - 12);
        _licenseCard.Bounds = new Rectangle(0, y, w, licenseHeight);
        y += licenseHeight + 12;

        _actionsCard.Bounds = new Rectangle(0, y, w, actionsHeight);

        _pathShell.Bounds = new Rectangle(20, 57, Math.Max(210, _pathCard.Width - 170), 40);
        _browseButton.Bounds = new Rectangle(_pathShell.Right + 10, 57, 116, 40);
        _installPathBox.Bounds = new Rectangle(14, 10, Math.Max(100, _pathShell.Width - 28), 20);

        _desktopShortcutCheck.Location = new Point(20, 53);
        _startMenuShortcutCheck.Location = new Point(230, 53);

        _licenseShell.Bounds = new Rectangle(20, 56, _licenseCard.Width - 40, _licenseCard.Height - 74);
        _licenseBox.Bounds = new Rectangle(12, 10, Math.Max(100, _licenseShell.Width - 24), Math.Max(60, _licenseShell.Height - 20));

        _acceptLicenseCheck.Location = new Point(20, 14);
        _statusLabel.Location = new Point(20, 42);
        _progressPanel.Bounds = new Rectangle(20, 67, Math.Max(220, _actionsCard.Width - 270), 18);
        _installButton.Bounds = new Rectangle(_actionsCard.Width - 124, 62, 104, 42);
        _cancelButton.Bounds = new Rectangle(_actionsCard.Width - 236, 62, 104, 42);
    }

    private void BeginDrag(MouseEventArgs args)
    {
        if (args.Button != MouseButtons.Left)
        {
            return;
        }

        ReleaseCapture();
        SendMessage(Handle, WmNcLButtonDown, HtCaption, 0);
    }

    private void SelectInstallFolder()
    {
        var ui = CurrentUi;

        using var dialog = new FolderBrowserDialog
        {
            Description = ui.FolderDialogDescription,
            UseDescriptionForTitle = true,
            ShowNewFolderButton = true,
            InitialDirectory = _installPathBox.Text,
        };

        if (dialog.ShowDialog(this) == DialogResult.OK)
        {
            _installPathBox.Text = dialog.SelectedPath;
        }
    }

    private UiCopy CurrentUi => _language == UiLanguage.Ru ? RuUi : EnUi;

    private void ToggleLanguage()
    {
        _language = _language == UiLanguage.En ? UiLanguage.Ru : UiLanguage.En;
        ApplyLanguage();
    }

    private void ApplyLanguage()
    {
        var ui = CurrentUi;

        Text = ui.WindowTitle;
        _titleModeLabel.Text = ui.TitleMode;
        _languageButton.Text = ui.LanguageToggle;

        _headerLabel.Text = ui.HeaderTitle;
        _subHeaderLabel.Text = ui.HeaderSubtitle;
        SetSectionText(_pathCard, ui.PathTitle, ui.PathSubtitle);
        SetSectionText(_optionsCard, ui.OptionsTitle, ui.OptionsSubtitle);
        SetSectionText(_licenseCard, ui.LicenseTitle, ui.LicenseSubtitle);

        _browseButton.Text = ui.Browse;
        _desktopShortcutCheck.Text = ui.DesktopShortcut;
        _startMenuShortcutCheck.Text = ui.StartMenuShortcut;
        _acceptLicenseCheck.Text = ui.AcceptLicense;
        _installButton.Text = ui.Install;
        _cancelButton.Text = ui.Cancel;

        _statusLabel.Text = LocalizeStatusText(_statusLabel.Text);

        _titleBar.Invalidate();
        _heroPanel.Invalidate();
        LayoutUi();
    }

    private static void SetSectionText(FxPanel panel, string title, string subtitle)
    {
        foreach (Control child in panel.Controls)
        {
            if (child is not Label label)
            {
                continue;
            }

            if (Equals(label.Tag, "title"))
            {
                label.Text = title;
                continue;
            }

            if (Equals(label.Tag, "sub"))
            {
                label.Text = subtitle;
            }
        }
    }

    private string LocalizeProgressMessage(string message)
    {
        if (_language == UiLanguage.En)
        {
            return message switch
            {
                "Проверка запущенных процессов..." => "Checking running app instances...",
                "Подготовка папки установки..." => "Preparing installation directory...",
                "Копирование файлов приложения..." => "Deploying application files...",
                "Создание деинсталлятора..." => "Writing uninstaller...",
                "Сохранение копии лицензии..." => "Saving license copy...",
                "Создание ярлыков..." => "Creating shortcuts...",
                "Портативная установка завершена." => "Portable installation completed.",
                _ => message,
            };
        }

        return message switch
        {
            "Checking running app instances..." => "Проверка запущенных процессов...",
            "Preparing installation directory..." => "Подготовка папки установки...",
            "Deploying application files..." => "Копирование файлов приложения...",
            "Writing uninstaller..." => "Создание деинсталлятора...",
            "Saving license copy..." => "Сохранение копии лицензии...",
            "Creating shortcuts..." => "Создание ярлыков...",
            "Portable installation completed." => "Портативная установка завершена.",
            _ => message,
        };
    }

    private string LocalizeStatusText(string text)
    {
        var en = EnUi;
        var ru = RuUi;

        if (_language == UiLanguage.Ru)
        {
            return text switch
            {
                var t when t == en.ReadyStatus => ru.ReadyStatus,
                var t when t == en.StartInstallStatus => ru.StartInstallStatus,
                var t when t == en.InstallCompletedStatus => ru.InstallCompletedStatus,
                var t when t == en.InstallFailedStatus => ru.InstallFailedStatus,
                _ => LocalizeProgressMessage(text),
            };
        }

        return text switch
        {
            var t when t == ru.ReadyStatus => en.ReadyStatus,
            var t when t == ru.StartInstallStatus => en.StartInstallStatus,
            var t when t == ru.InstallCompletedStatus => en.InstallCompletedStatus,
            var t when t == ru.InstallFailedStatus => en.InstallFailedStatus,
            _ => LocalizeProgressMessage(text),
        };
    }

    private void UpdateInstallButtonState()
    {
        _installButton.Enabled = _acceptLicenseCheck.Checked && !_isInstalling;
    }

    private async Task InstallAsync()
    {
        var ui = CurrentUi;
        ToggleInputs(false);

        _progressPercent = 0;
        _statusLabel.Text = ui.StartInstallStatus;
        _statusLabel.ForeColor = Color.FromArgb(125, 211, 252);
        _progressPanel.Invalidate();

        var progress = new Progress<InstallProgress>(p =>
        {
            _progressPercent = Math.Clamp(p.Percent, 0, 100);
            _statusLabel.Text = LocalizeProgressMessage(p.Message);
            _progressPanel.Invalidate();
        });

        try
        {
            var options = new InstallOptions(_installPathBox.Text, _desktopShortcutCheck.Checked, _startMenuShortcutCheck.Checked);
            await Task.Run(() => InstallerService.Install(options, progress));

            _progressPercent = 100;
            _statusLabel.Text = ui.InstallCompletedStatus;
            _statusLabel.ForeColor = Color.FromArgb(134, 239, 172);
            _progressPanel.Invalidate();

            MessageBox.Show(this, ui.SuccessMessage, ui.SuccessTitle, MessageBoxButtons.OK, MessageBoxIcon.Information);
            Close();
        }
        catch (Exception ex)
        {
            _statusLabel.Text = ui.InstallFailedStatus;
            _statusLabel.ForeColor = Color.FromArgb(252, 165, 165);
            _progressPanel.Invalidate();

            MessageBox.Show(this, ui.InstallFailedStatus + "\n" + ex.Message, ui.ErrorTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            ToggleInputs(true);
        }
    }

    private void ToggleInputs(bool enabled)
    {
        _isInstalling = !enabled;
        _browseButton.Enabled = enabled;
        _installPathBox.Enabled = enabled;
        _desktopShortcutCheck.Enabled = enabled;
        _startMenuShortcutCheck.Enabled = enabled;
        _acceptLicenseCheck.Enabled = enabled;
        _cancelButton.Enabled = enabled;
        UpdateInstallButtonState();

        if (enabled && _progressPercent == 0)
        {
            _statusLabel.Text = CurrentUi.ReadyStatus;
        }
    }

    private void Animate()
    {
        var dt = (float)_clock.Elapsed.TotalSeconds;
        if (dt <= 0f || dt > 0.5f)
        {
            dt = 0.016f;
        }

        _clock.Restart();

        _time += dt;
        _progressShimmer += dt * 240f;
        _pathGlow = Lerp(_pathGlow, _pathFocused ? 1f : 0f, Math.Clamp(dt * 10f, 0f, 1f));
        _languageSwitchProgress = Lerp(_languageSwitchProgress, _language == UiLanguage.Ru ? 1f : 0f, Math.Clamp(dt * 12f, 0f, 1f));
        _languageButton.LanguageProgress = _languageSwitchProgress;

        foreach (var item in _buttonAnims)
        {
            var b = item.Key;
            var a = item.Value;

            if (!b.Enabled)
            {
                b.BackColor = Color.FromArgb(17, 24, 39);
                b.ForeColor = Color.FromArgb(100, 116, 139);
                b.BorderColor = Color.FromArgb(51, 65, 85);
                continue;
            }

            a.Hover = Lerp(a.Hover, a.HoverTarget ? 1f : 0f, Math.Clamp(dt * 12f, 0f, 1f));
            a.Press = Lerp(a.Press, a.PressTarget ? 1f : 0f, Math.Clamp(dt * 16f, 0f, 1f));

            var bg = Blend(a.Theme.Base, a.Theme.Hover, a.Hover);
            bg = Blend(bg, a.Theme.Pressed, a.Press);

            b.BackColor = bg;
            b.ForeColor = a.Theme.Text;
            b.BorderColor = Blend(a.Theme.Border, a.Theme.BorderHover, a.Hover);
        }

        if (Opacity < 1d)
        {
            Opacity = Math.Min(1d, Opacity + dt * 3.2d);
        }

        _titleBar.Invalidate();
        _heroPanel.Invalidate();
        _pathShell.Invalidate();

        if (_isInstalling || _progressPercent is > 0 and < 100)
        {
            _progressPanel.Invalidate();
        }
    }

    private void PaintTitleBar(Graphics g, Rectangle r)
    {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        using var bg = new LinearGradientBrush(r, Color.FromArgb(5, 16, 35), Color.FromArgb(3, 10, 24), LinearGradientMode.Vertical);
        g.FillRectangle(bg, r);

        using var line = new Pen(Color.FromArgb(45, 56, 189, 248), 1f);
        g.DrawLine(line, r.Left, r.Bottom - 1, r.Right, r.Bottom - 1);

        using var dot = new SolidBrush(Color.FromArgb(34, 211, 238));
        g.FillEllipse(dot, 16, 19, 9, 9);
        using var halo = new SolidBrush(Color.FromArgb(55, 34, 211, 238));
        g.FillEllipse(halo, 12, 15, 17, 17);
    }

    private void PaintHero(Graphics g, Rectangle bounds)
    {
        if (bounds.Width <= 2 || bounds.Height <= 2)
        {
            return;
        }

        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.CompositingQuality = CompositingQuality.HighQuality;

        PaintCard(g, bounds, Color.FromArgb(9, 31, 63), Color.FromArgb(3, 12, 30), Color.FromArgb(86, 56, 189, 248), 30, 0);

        var clip = g.Save();
        using var path = RoundRect(Rectangle.Inflate(bounds, -1, -1), 30);
        g.SetClip(path);

        var shift = (int)((_time * 18f) % 28f);
        using var grid = new Pen(Color.FromArgb(16, 148, 163, 184), 1f);
        for (var x = -28; x < bounds.Width + 28; x += 28)
        {
            g.DrawLine(grid, bounds.Left + x + shift, bounds.Top, bounds.Left + x + shift, bounds.Bottom);
        }

        foreach (var orb in _orbs)
        {
            var x = bounds.Left + (bounds.Width * orb.BaseX) + (MathF.Cos((_time * orb.Speed) + orb.Phase) * orb.DriftX);
            var y = bounds.Top + (bounds.Height * orb.BaseY) + (MathF.Sin((_time * orb.Speed * 1.31f) + orb.Phase) * orb.DriftY);
            var rect = new RectangleF(x - orb.Radius, y - orb.Radius, orb.Radius * 2f, orb.Radius * 2f);
            using var p = new GraphicsPath();
            p.AddEllipse(rect);
            using var b = new PathGradientBrush(p)
            {
                CenterColor = Color.FromArgb(orb.Alpha, orb.Color),
                SurroundColors = new[] { Color.FromArgb(0, orb.Color) },
            };
            g.FillEllipse(b, rect);
        }

        var graph = new Rectangle(bounds.Left + 24, bounds.Top + 160, bounds.Width - 48, 120);
        using var graphPath = RoundRect(graph, 18);
        using var graphFill = new SolidBrush(Color.FromArgb(40, 3, 10, 24));
        g.FillPath(graphFill, graphPath);

        using var penTrail = new Pen(Color.FromArgb(38, 34, 211, 238), 5f) { StartCap = LineCap.Round, EndCap = LineCap.Round };
        using var penSignal = new Pen(Color.FromArgb(165, 34, 211, 238), 2f) { StartCap = LineCap.Round, EndCap = LineCap.Round };
        var pts = new List<PointF>(72);
        for (var i = 0; i < 72; i += 1)
        {
            var t = i / 71f;
            var x = graph.Left + 10f + ((graph.Width - 20f) * t);
            var y = graph.Top + (graph.Height / 2f) + MathF.Sin((t * 12f) + (_time * 2.3f)) * 8f + MathF.Sin((t * 34f) - (_time * 3.7f)) * 2f;
            pts.Add(new PointF(x, y));
        }

        var arr = pts.ToArray();
        g.DrawLines(penTrail, arr);
        g.DrawLines(penSignal, arr);
        g.Restore(clip);

        using var title = new SolidBrush(Color.FromArgb(240, 248, 255));
        using var sub = new SolidBrush(Color.FromArgb(165, 196, 216));
        using var body = new SolidBrush(Color.FromArgb(186, 215, 235));
        using var code = new SolidBrush(Color.FromArgb(125, 211, 252));
        var ui = CurrentUi;

        g.DrawString("GreatCalc", _heroTitleFont, title, new PointF(28, 26));
        g.DrawString(ui.HeroSubtitle, _heroSubFont, sub, new PointF(32, 78));

        var info = new Rectangle(24, bounds.Height - 206, bounds.Width - 48, 176);
        PaintCard(g, info, Color.FromArgb(95, 7, 16, 32), Color.FromArgb(78, 5, 12, 24), Color.FromArgb(68, 125, 211, 252), 22, 0);
        g.DrawString(ui.HeroInfoTitle, _heroSubFont, title, new PointF(info.Left + 18, info.Top + 14));
        g.DrawString(ui.HeroLine1, _heroBodyFont, body, new PointF(info.Left + 20, info.Top + 42));
        g.DrawString(ui.HeroLine2, _heroBodyFont, body, new PointF(info.Left + 20, info.Top + 66));
        g.DrawString(ui.HeroLine3, _heroBodyFont, body, new PointF(info.Left + 20, info.Top + 90));
        g.DrawString(ui.HeroLine4, _heroBodyFont, body, new PointF(info.Left + 20, info.Top + 114));

        var commandRect = new Rectangle(info.Left + 20, info.Bottom - 30, info.Width - 40, 18);
        TextRenderer.DrawText(
            g,
            $"deploy --target \"{InstallerMetadata.DefaultInstallPath}\"",
            _heroCodeFont,
            commandRect,
            code.Color,
            TextFormatFlags.EndEllipsis | TextFormatFlags.NoPrefix | TextFormatFlags.VerticalCenter | TextFormatFlags.Left);
    }

    private void PaintPathShell(Graphics g, Rectangle r)
    {
        var border = Blend(Color.FromArgb(71, 85, 105), Color.FromArgb(34, 211, 238), _pathGlow);
        var glow = (int)(70 * _pathGlow);
        PaintCard(g, r, Color.FromArgb(10, 20, 38), Color.FromArgb(7, 15, 30), border, 16, glow);
    }

    private void PaintProgress(Graphics g, Rectangle r)
    {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        PaintCard(g, r, Color.FromArgb(8, 17, 34), Color.FromArgb(6, 13, 26), Color.FromArgb(51, 65, 85), 12, 0);

        if (_progressPercent <= 0)
        {
            return;
        }

        var width = Math.Max(2, (int)Math.Round((r.Width - 2) * (_progressPercent / 100f)));
        var fill = new Rectangle(r.X + 1, r.Y + 1, width, r.Height - 2);

        using var fillPath = RoundRect(fill, 10);
        using var fillBrush = new LinearGradientBrush(fill, Color.FromArgb(34, 211, 238), Color.FromArgb(14, 165, 233), LinearGradientMode.Horizontal);
        g.FillPath(fillBrush, fillPath);
        using var fillBorder = new Pen(Color.FromArgb(125, 211, 252), 1f);
        g.DrawPath(fillBorder, fillPath);

        if (_progressPercent is > 0 and < 100)
        {
            var sw = 100;
            var sx = (int)(_progressShimmer % (fill.Width + sw)) - sw;
            var shimmer = new Rectangle(fill.X + sx, fill.Y, sw, fill.Height);

            using var b = new LinearGradientBrush(shimmer, Color.Transparent, Color.Transparent, LinearGradientMode.Horizontal)
            {
                InterpolationColors = new ColorBlend
                {
                    Colors = new[] { Color.FromArgb(0, 255, 255, 255), Color.FromArgb(85, 255, 255, 255), Color.FromArgb(0, 255, 255, 255) },
                    Positions = new[] { 0f, 0.5f, 1f },
                },
            };

            var state = g.Save();
            g.SetClip(fillPath);
            g.FillRectangle(b, shimmer);
            g.Restore(state);
        }
    }

    private static void PaintCard(Graphics g, Rectangle bounds, Color top, Color bottom, Color border, int radius, int glow)
    {
        if (bounds.Width <= 2 || bounds.Height <= 2)
        {
            return;
        }

        g.SmoothingMode = SmoothingMode.AntiAlias;
        var frame = Rectangle.Inflate(bounds, -1, -1);

        using var path = RoundRect(frame, radius);
        using var fill = new LinearGradientBrush(frame, top, bottom, LinearGradientMode.Vertical);
        g.FillPath(fill, path);

        if (glow > 0)
        {
            using var p = new Pen(Color.FromArgb(Math.Clamp(glow, 0, 140), 56, 189, 248), 2f);
            g.DrawPath(p, path);
        }

        using var line = new Pen(border, 1f);
        g.DrawPath(line, path);
    }

    private static GraphicsPath RoundRect(Rectangle r, int radius)
    {
        var path = new GraphicsPath();
        var rr = Math.Max(1, Math.Min(radius, Math.Min(r.Width, r.Height) / 2));
        var d = rr * 2;

        path.StartFigure();
        path.AddArc(r.X, r.Y, d, d, 180, 90);
        path.AddArc(r.Right - d, r.Y, d, d, 270, 90);
        path.AddArc(r.Right - d, r.Bottom - d, d, d, 0, 90);
        path.AddArc(r.X, r.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }

    private static void ApplyRoundRegion(Control c, int radius)
    {
        if (c.Width <= 1 || c.Height <= 1)
        {
            return;
        }

        var old = c.Region;
        using var path = RoundRect(new Rectangle(0, 0, c.Width, c.Height), radius);
        c.Region = new Region(path);
        old?.Dispose();
    }

    private static float Lerp(float from, float to, float t) => from + ((to - from) * Math.Clamp(t, 0f, 1f));

    private static Color Blend(Color from, Color to, float t)
    {
        t = Math.Clamp(t, 0f, 1f);
        return Color.FromArgb(
            (int)Math.Round(from.A + ((to.A - from.A) * t)),
            (int)Math.Round(from.R + ((to.R - from.R) * t)),
            (int)Math.Round(from.G + ((to.G - from.G) * t)),
            (int)Math.Round(from.B + ((to.B - from.B) * t)));
    }

    private readonly record struct Orb(float BaseX, float BaseY, float Radius, float DriftX, float DriftY, float Speed, float Phase, Color Color, int Alpha);

    private readonly record struct ButtonTheme(Color Base, Color Hover, Color Pressed, Color Border, Color BorderHover, Color Text);

    private enum UiLanguage
    {
        En,
        Ru,
    }

    private readonly record struct UiCopy(
        string WindowTitle,
        string TitleMode,
        string HeaderTitle,
        string HeaderSubtitle,
        string PathTitle,
        string PathSubtitle,
        string Browse,
        string OptionsTitle,
        string OptionsSubtitle,
        string DesktopShortcut,
        string StartMenuShortcut,
        string LicenseTitle,
        string LicenseSubtitle,
        string AcceptLicense,
        string ReadyStatus,
        string Install,
        string Cancel,
        string LanguageToggle,
        string FolderDialogDescription,
        string StartInstallStatus,
        string InstallCompletedStatus,
        string InstallFailedStatus,
        string SuccessMessage,
        string SuccessTitle,
        string ErrorTitle,
        string HeroSubtitle,
        string HeroInfoTitle,
        string HeroLine1,
        string HeroLine2,
        string HeroLine3,
        string HeroLine4);

    private sealed class ButtonAnim(ButtonTheme theme)
    {
        public ButtonTheme Theme { get; } = theme;
        public float Hover { get; set; }
        public float Press { get; set; }
        public bool HoverTarget { get; set; }
        public bool PressTarget { get; set; }
    }

    private sealed class FxPanel : Panel
    {
        public FxPanel()
        {
            DoubleBuffered = true;
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw | ControlStyles.UserPaint, true);
        }
    }

    private sealed class FxButton : Button
    {
        private Color _borderColor = Color.Transparent;
        private int _cornerRadius = 12;
        private float _languageProgress;

        public Color BorderColor
        {
            get => _borderColor;
            set
            {
                if (_borderColor == value)
                {
                    return;
                }

                _borderColor = value;
                Invalidate();
            }
        }

        public int CornerRadius
        {
            get => _cornerRadius;
            set
            {
                var normalized = Math.Max(2, value);
                if (_cornerRadius == normalized)
                {
                    return;
                }

                _cornerRadius = normalized;
                UpdateButtonRegion();
                Invalidate();
            }
        }

        public bool IsLanguageToggle { get; set; }

        public float LanguageProgress
        {
            get => _languageProgress;
            set
            {
                var normalized = Math.Clamp(value, 0f, 1f);
                if (Math.Abs(_languageProgress - normalized) < 0.0001f)
                {
                    return;
                }

                _languageProgress = normalized;
                Invalidate();
            }
        }

        public FxButton()
        {
            DoubleBuffered = true;
            SetStyle(
                ControlStyles.AllPaintingInWmPaint
                | ControlStyles.OptimizedDoubleBuffer
                | ControlStyles.ResizeRedraw
                | ControlStyles.UserPaint,
                true);

            FlatStyle = FlatStyle.Flat;
            FlatAppearance.BorderSize = 0;
            UseVisualStyleBackColor = false;
            BackColor = Color.FromArgb(8, 18, 34);
        }

        protected override void OnResize(EventArgs e)
        {
            base.OnResize(e);
            UpdateButtonRegion();
        }

        protected override void OnPaintBackground(PaintEventArgs pevent)
        {
            // fully custom painting to avoid square artifacts from default background fill
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            if (Width <= 2 || Height <= 2)
            {
                return;
            }

            e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
            e.Graphics.CompositingQuality = CompositingQuality.HighQuality;
            e.Graphics.PixelOffsetMode = PixelOffsetMode.None;

            var frame = new Rectangle(0, 0, Width - 1, Height - 1);
            using var path = RoundRect(frame, _cornerRadius);
            using var fill = new SolidBrush(BackColor);
            e.Graphics.FillPath(fill, path);

            using var border = new Pen(_borderColor, 1f) { Alignment = PenAlignment.Inset };
            e.Graphics.DrawPath(border, path);

            if (IsLanguageToggle)
            {
                PaintLanguageToggle(e.Graphics, frame);
                return;
            }

            TextRenderer.DrawText(
                e.Graphics,
                Text,
                Font,
                frame,
                ForeColor,
                TextFormatFlags.HorizontalCenter
                | TextFormatFlags.VerticalCenter
                | TextFormatFlags.NoPrefix
                | TextFormatFlags.EndEllipsis
                | TextFormatFlags.PreserveGraphicsTranslateTransform);
        }

        private void PaintLanguageToggle(Graphics g, Rectangle frame)
        {
            var inner = Rectangle.Inflate(frame, -2, -2);
            var segmentWidth = Math.Max(8, inner.Width / 2);
            var segmentHeight = inner.Height;

            var sliderTravel = Math.Max(0, inner.Width - segmentWidth);
            var sliderX = inner.X + (int)Math.Round(_languageProgress * sliderTravel);
            var sliderRect = new Rectangle(sliderX, inner.Y, segmentWidth, segmentHeight);

            using var sliderPath = RoundRect(sliderRect, Math.Max(6, _cornerRadius - 4));
            using var sliderBrush = new LinearGradientBrush(
                sliderRect,
                Color.FromArgb(28, 138, 255),
                Color.FromArgb(34, 211, 238),
                LinearGradientMode.Horizontal);
            g.FillPath(sliderBrush, sliderPath);

            using var sliderBorder = new Pen(Color.FromArgb(180, 125, 211, 252), 1f);
            g.DrawPath(sliderBorder, sliderPath);

            var leftRect = new Rectangle(inner.X + 2, inner.Y, Math.Max(6, segmentWidth - 4), inner.Height);
            var rightRect = new Rectangle(inner.X + segmentWidth + 2, inner.Y, Math.Max(6, segmentWidth - 4), inner.Height);

            var leftColor = Blend(Color.FromArgb(226, 232, 240), Color.FromArgb(10, 20, 38), _languageProgress);
            var rightColor = Blend(Color.FromArgb(10, 20, 38), Color.FromArgb(226, 232, 240), _languageProgress);

            var textFlags =
                TextFormatFlags.HorizontalCenter
                | TextFormatFlags.VerticalCenter
                | TextFormatFlags.NoPrefix
                | TextFormatFlags.EndEllipsis;

            TextRenderer.DrawText(g, "EN", Font, leftRect, leftColor, textFlags);
            TextRenderer.DrawText(g, "RU", Font, rightRect, rightColor, textFlags);
        }

        private void UpdateButtonRegion()
        {
            if (Width <= 2 || Height <= 2)
            {
                return;
            }

            var old = Region;
            using var regionPath = RoundRect(new Rectangle(0, 0, Width - 1, Height - 1), _cornerRadius + 1);
            Region = new Region(regionPath);
            old?.Dispose();
        }
    }

    private const int WmNcLButtonDown = 0xA1;
    private const int HtCaption = 0x2;

    [DllImport("user32.dll")]
    private static extern bool ReleaseCapture();

    [DllImport("user32.dll")]
    private static extern nint SendMessage(nint hWnd, int msg, int wParam, int lParam);
}
