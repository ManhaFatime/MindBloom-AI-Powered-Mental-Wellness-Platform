<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/mail_config.php";

try {
    $mail = createMindBloomMailer();

    // Yahan apna personal email likhein
    $mail->addAddress(
        "manhalearning2712@gmail.com",
        "MindBloom User"
    );

    $mail->Subject = "MindBloom Email Test";

    $mail->Body = '
        <div style="
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background: linear-gradient(
                135deg,
                #f1efff,
                #edf7ff,
                #eaf9f4
            );
            border-radius: 24px;
            font-family: Arial, sans-serif;
            color: #273149;
        ">
            <div style="text-align: center;">
                <h1 style="
                    margin: 0;
                    color: #8174d2;
                ">
                    MindBloom 🌸
                </h1>

                <p style="
                    margin-top: 8px;
                    color: #65718a;
                ">
                    Your safe space for wellness and personal growth
                </p>
            </div>

            <div style="
                margin-top: 25px;
                padding: 24px;
                background: rgba(255, 255, 255, 0.85);
                border-radius: 18px;
            ">
                <h2 style="
                    margin-top: 0;
                    color: #273149;
                ">
                    Email Setup Successful!
                </h2>

                <p style="
                    line-height: 1.7;
                    color: #65718a;
                ">
                    This is a test email from the MindBloom website.
                    PHPMailer and Gmail SMTP are working successfully.
                </p>

                <p style="
                    line-height: 1.7;
                    color: #65718a;
                ">
                    You can now send welcome emails, login notifications,
                    profile updates and wellness reminders.
                </p>
            </div>

            <p style="
                margin-top: 25px;
                text-align: center;
                font-size: 13px;
                color: #8791a4;
            ">
                © MindBloom Wellness
            </p>
        </div>
    ';

    $mail->AltBody =
        "MindBloom email setup is working successfully.";

    $mail->send();

    echo json_encode([
        "success" => true,
        "message" => "Test email sent successfully."
    ]);

} catch (Exception $error) {
    echo json_encode([
        "success" => false,
        "message" => "Email could not be sent.",
        "error" => $error->getMessage()
    ]);
}