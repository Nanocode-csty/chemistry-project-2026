using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net.Sockets;
using System.Windows.Forms;

public class LabcamLauncher : Form
{
    private Process backendProc;
    private Process frontendProc;
    private Label statusLabel;
    private Button openBtn;
    private Button stopBtn;
    private Timer pollTimer;
    private int pollTicks = 0;

    public LabcamLauncher()
    {
        this.Text = "INVENTA | roo Soluciones Digitales - Sistema de Gestión de Inventarios";
        this.Size = new Size(540, 275);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.BackColor = Color.FromArgb(248, 250, 252);

        Label title = new Label();
        title.Text = "INVENTA • ROO SOLUCIONES DIGITALES";
        title.Font = new Font("Segoe UI", 13, FontStyle.Bold);
        title.ForeColor = Color.FromArgb(15, 23, 42);
        title.Location = new Point(25, 20);
        title.Size = new Size(480, 30);
        this.Controls.Add(title);

        statusLabel = new Label();
        statusLabel.Text = "⏳ Iniciando base de datos embebida (PGlite) y servidor INVENTA...\nPor favor espera unos segundos...";
        statusLabel.Font = new Font("Segoe UI", 10, FontStyle.Regular);
        statusLabel.ForeColor = Color.FromArgb(51, 65, 85);
        statusLabel.Location = new Point(25, 58);
        statusLabel.Size = new Size(480, 68);
        this.Controls.Add(statusLabel);

        openBtn = new Button();
        openBtn.Text = "Cargando servidor local...";
        openBtn.Enabled = false;
        openBtn.Font = new Font("Segoe UI", 10, FontStyle.Bold);
        openBtn.BackColor = Color.FromArgb(148, 163, 184);
        openBtn.ForeColor = Color.White;
        openBtn.FlatStyle = FlatStyle.Flat;
        openBtn.Location = new Point(25, 135);
        openBtn.Size = new Size(475, 40);
        openBtn.Click += (s, e) => Process.Start("http://localhost:3005/intranet/login");
        this.Controls.Add(openBtn);

        stopBtn = new Button();
        stopBtn.Text = "Detener Servidor y Salir";
        stopBtn.Font = new Font("Segoe UI", 9, FontStyle.Regular);
        stopBtn.BackColor = Color.FromArgb(226, 232, 240);
        stopBtn.ForeColor = Color.FromArgb(30, 41, 59);
        stopBtn.FlatStyle = FlatStyle.Flat;
        stopBtn.Location = new Point(25, 185);
        stopBtn.Size = new Size(475, 32);
        stopBtn.Click += (s, e) => this.Close();
        this.Controls.Add(stopBtn);

        this.Load += OnLoadApp;
        this.FormClosing += OnClosingApp;
    }

    private void KillProcessOnPort(int port)
    {
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "cmd.exe";
            psi.Arguments = "/c for /f \"tokens=5\" %a in ('netstat -aon ^| findstr :" + port + " ^| findstr LISTENING') do taskkill /F /PID %a";
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            Process p = Process.Start(psi);
            p.WaitForExit(2000);
        }
        catch { }
    }

    private bool IsPortOpen(int port)
    {
        try
        {
            using (TcpClient client = new TcpClient())
            {
                var result = client.BeginConnect("127.0.0.1", port, null, null);
                var success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromMilliseconds(250));
                if (!success) return false;
                client.EndConnect(result);
                return true;
            }
        }
        catch
        {
            return false;
        }
    }

    private void OnLoadApp(object sender, EventArgs e)
    {
        try
        {
            KillProcessOnPort(3005);
            KillProcessOnPort(4005);

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string nodeExe = Path.Combine(baseDir, "runtime", "node.exe");
            if (!File.Exists(nodeExe))
            {
                nodeExe = "node";
            }

            string backDir = Path.Combine(baseDir, "backend");
            string frontDir = Path.Combine(baseDir, "frontend");

            // 1. Iniciar Backend con PGlite Embebido (Puerto 4005)
            ProcessStartInfo backPsi = new ProcessStartInfo();
            backPsi.FileName = nodeExe;
            backPsi.Arguments = "\"" + Path.Combine(backDir, "src", "index.js") + "\"";
            backPsi.WorkingDirectory = backDir;
            backPsi.UseShellExecute = false;
            backPsi.CreateNoWindow = true;
            backPsi.EnvironmentVariables["USE_PGLITE"] = "true";
            backPsi.EnvironmentVariables["PORT"] = "4005";
            backPsi.EnvironmentVariables["ADMIN_EMAIL"] = "admin@escuela-iq.edu";
            backPsi.EnvironmentVariables["ADMIN_PASSWORD"] = "admin123";
            backendProc = Process.Start(backPsi);

            // 2. Iniciar Frontend Next.js Standalone (Puerto 3005)
            ProcessStartInfo frontPsi = new ProcessStartInfo();
            frontPsi.FileName = nodeExe;
            frontPsi.Arguments = "\"" + Path.Combine(frontDir, "server.js") + "\"";
            frontPsi.WorkingDirectory = frontDir;
            frontPsi.UseShellExecute = false;
            frontPsi.CreateNoWindow = true;
            frontPsi.EnvironmentVariables["PORT"] = "3005";
            frontPsi.EnvironmentVariables["HOSTNAME"] = "127.0.0.1";
            frontPsi.EnvironmentVariables["BACKEND_INTERNAL_URL"] = "http://127.0.0.1:4005";
            frontPsi.EnvironmentVariables["NEXT_PUBLIC_BACKEND_URL"] = "/api";
            frontendProc = Process.Start(frontPsi);

            pollTimer = new Timer();
            pollTimer.Interval = 500;
            pollTimer.Tick += (s, ev) =>
            {
                pollTicks++;
                bool frontReady = IsPortOpen(3005);
                bool backReady = IsPortOpen(4005);
                if (frontReady && backReady)
                {
                    pollTimer.Stop();
                    statusLabel.Text = "✅ INVENTA Activo (Sin Docker ni PostgreSQL externo)\n• URL Local: http://localhost:3005/intranet/login\n• Usuario: admin@escuela-iq.edu  |  Clave: admin123";
                    openBtn.Text = "Abrir INVENTA en el Navegador (http://localhost:3005)";
                    openBtn.BackColor = Color.FromArgb(132, 204, 22);
                    openBtn.Enabled = true;
                    Process.Start("http://localhost:3005/intranet/login");
                }
                else if (pollTicks > 60)
                {
                    pollTimer.Stop();
                    statusLabel.Text = "⚠️ El servidor tardó más de lo esperado en responder.\nHaz clic abajo para intentar abrir http://localhost:3005/intranet/login";
                    openBtn.Enabled = true;
                }
            };
            pollTimer.Start();
        }
        catch (Exception ex)
        {
            MessageBox.Show("Error al iniciar INVENTA: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private void OnClosingApp(object sender, FormClosingEventArgs e)
    {
        try { if (pollTimer != null) pollTimer.Stop(); } catch { }
        try { if (frontendProc != null && !frontendProc.HasExited) frontendProc.Kill(); } catch { }
        try { if (backendProc != null && !backendProc.HasExited) backendProc.Kill(); } catch { }
        KillProcessOnPort(3005);
        KillProcessOnPort(4005);
    }

    [STAThread]
    public static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new LabcamLauncher());
    }
}
