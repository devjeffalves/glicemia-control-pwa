import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
    // Para simplificar, estamos usando variáveis de ambiente para configuração
    // Se não estiverem configuradas, o email não será enviado (útil para desenvolvimento local se não quiser configurar agora)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === "465", // true para 465, false para outras portas
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            ciphers: "SSLv3",
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.sendMail({
            from: `"Controle de Glicemia" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao enviar email:", error);
        return { success: false, error };
    }
};
