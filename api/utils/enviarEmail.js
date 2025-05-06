import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

export const enviarEmail = async ({ to, subject, html, attachments = [] }) => {
  const form = new FormData();

  form.append('from', `Zabor Féten <no-reply@${MAILGUN_DOMAIN}>`);
  form.append('to', to);
  form.append('subject', subject);
  form.append('html', html);

  // Adjuntos inline (para cid:)
  for (const filePath of attachments) {
    const absolutePath = path.resolve(filePath);
    if (fs.existsSync(absolutePath)) {
      const filename = path.basename(absolutePath);
      form.append('inline', fs.createReadStream(absolutePath), {
        filename,
        contentType: 'image/jpeg',
        knownLength: fs.statSync(absolutePath).size,
      });
    }
  }

  try {
    await axios.post(
      `https://api.eu.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      form,
      {
        auth: {
          username: 'api',
          password: MAILGUN_API_KEY,
        },
        headers: form.getHeaders(),
      }
    );
    console.log('Correo enviado con Mailgun');
  } catch (err) {
    console.error(
      'Error al enviar correo con Mailgun:',
      err.response?.data || err
    );
  }
};
