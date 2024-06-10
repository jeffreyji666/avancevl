import nodemailer from "nodemailer";

const sendEmail = async (email: string, link: string) => {
  try {
    const output = `
      <h1>verify your email!<h1>
      <p>click <a href="${link}">${link}</a></p>
    `;
    let transporter = nodemailer.createTransport({
      host: "smtp.qq.com",
      port: 465,
      secure: true,
      auth: {
        user: 'mansulee@foxmail.com',
        pass: 'baaapmvhwundbjad'
      },
    });
    let mailOptions = {
      from: "mansulee@foxmail.com",   // You can change this to whatever you like. !this is NOT where you add in the email address!
      to: email,    // Use your same googele email ("send yourself an email") to test if the app works.
      subject: "verify your email",   // change the subject to whatever you like.
      html: output,   // this is the output variable defined earlier that contains our message.
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);   // if anything goes wrong an error will show up in your terminal.
      } else {
        console.log("Message sent: %s", info.messageId);    // if it's a success, a confirmation will show up in your terminal.
      }
    });
    console.log('>>>>>>>>>>>>>>>>>>>.');

  } catch (err) {
    console.log(err);

    return err;
  }
};


export { sendEmail };