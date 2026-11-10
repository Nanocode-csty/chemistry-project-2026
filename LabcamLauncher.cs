using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

public class LabcamLauncher : Form
{
    private Process backendProc;
    private Process frontendProc;
    private Label statusLabel;
    private Button openBtn;
    private Button stopBtn;

    public LabcamLauncher()
    {
        this.Text = "INVENTA | roo Soluciones Digitales - Sistema de Gestión de Inventarios";
        this.Size = new Size(540, 270);
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
        statusLabel.Text = "Iniciando base de datos embebida (PGlite) y servidor local...";
        statusLabel.Font = new Font("Segoe UI", 10, FontStyle.Regular);
        statusLabel.ForeColor = Color.FromArgb(51, 65, 85);
        statusLabel.Location = new Point(25, 60);
        statusLabel.Size = new Size(480, 65);
        this.Controls.Add(statusLabel);

        openBtn = new Button();
        openBtn.Text = "Abrir INVENTA en el Navegador (http://localhost:3005)";
        openBtn.Font = new Font("Segoe UI", 10, FontStyle.Bold);
        openBtn.BackColor = Color.FromArgb(132, 204, 22);
        openBtn.ForeColor = Color.White;
        openBtn.FlatStyle = FlatStyle.Flat;
        openBtn.Location = new Point(25, 135);
        openBtn.Size = new Size(475, 40);
        openBtn.Click += (s, e) => Process.Start("http://localhost:3005");
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

    private void OnLoadApp(object sender, EventArgs e)
    {
        try
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string nodeExe = Path.Combine(baseDir, "runtime", "node.exe");
            if (!File.Exists(nodeExe))
            {
                nodeExe = "node";
            }

            // 1. Iniciar Backend con PGlite Embebido (Puerto 4005)
            ProcessStartInfo backPsi = new ProcessStartInfo();
            backPsi.FileName = nodeExe;
            backPsi.Arguments = "src/index.js";
            backPsi.WorkingDirectory = Path.Combine(baseDir, "backend");
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
            frontPsi.Arguments = "server.js";
            frontPsi.WorkingDirectory = Path.Combine(baseDir, "frontend");
            frontPsi.UseShellExecute = false;
            frontPsi.CreateNoWindow = true;
            frontPsi.EnvironmentVariables["PORT"] = "3005";
            frontPsi.EnvironmentVariables["HOSTNAME"] = "0.0.0.0";
            frontPsi.EnvironmentVariables["BACKEND_INTERNAL_URL"] = "http://127.0.0.1:4005";
            frontPsi.EnvironmentVariables["NEXT_PUBLIC_BACKEND_URL"] = "/api";
            frontendProc = Process.Start(frontPsi);

            statusLabel.Text = "✅ INVENTA Activo (Sin Docker ni PostgreSQL externo)\n• URL Local: http://localhost:3005\n• Usuario: admin@escuela-iq.edu  |  Clave: admin123";

            Timer t = new Timer();
            t.Interval = 3500;
            t.Tick += (s, ev) => {
                t.Stop();
                Process.Start("http://localhost:3005");
            };
            t.Start();
        }
        catch (Exception ex)
        {
            MessageBox.Show("Error al iniciar INVENTA: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private void OnClosingApp(object sender, FormClosingEventArgs e)
    {
        try { if (frontendProc != null && !frontendProc.HasExited) frontendProc.Kill(); } catch { }
        try { if (backendProc != null && !backendProc.HasExited) backendProc.Kill(); } catch { }
    }

    [STAThread]
    public static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new LabcamLauncher());
    }
}
