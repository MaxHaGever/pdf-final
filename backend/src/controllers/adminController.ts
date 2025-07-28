import { Request, Response } from "express";
import { User } from "../models/User";
import { sendEmail } from "../utils/mailer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { ReportLog } from "../models/reportLog";

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}, "email companyName isAdmin hasChangedPassword hasAcceptedTerms createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to load users" });
  }
};

export const promoteToAdmin = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User promoted to admin", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to promote user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const inviteUser = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const tempPassword = crypto.randomBytes(4).toString('hex');

  const existing = await User.findOne({ email });

  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = new User({
    email,
    password: tempPassword,
    hasAcceptedTerms: false,
    hasChangedPassword: false,
    isAdmin: false
  });

  await newUser.save();

  await sendEmail({
  to: email,
  subject: 'הוזמנת למערכת',
  text: `הוזמנת להשתמש במערכת. הסיסמה הזמנית שלך היא: ${tempPassword}. התחבר כאן: ${process.env.FRONTEND_URL}`,
  html: `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>הוזמנת להשתמש במערכת</h2>
      <p>שלום,</p>
      <p>הוזמנת להשתמש במערכת שלנו. להלן הסיסמה הזמנית שלך:</p>
      <p style="font-size: 1.2em; font-weight: bold; text-align: right;">${tempPassword}</p>
      <p>באפשרותך להתחבר למערכת בקישור הבא:</p>
      <p>
        <a href="${process.env.FRONTEND_URL}" style="color: #2563eb;">
          ${process.env.FRONTEND_URL}
        </a>
      </p>
      <p>אם לא ביקשת את ההזמנה הזו, ניתן להתעלם מהודעה זו.</p>
      <hr style="margin-top: 30px;" />
      <p style="font-size: 0.85em; color: #777;">הודעה זו נשלחה אוטומטית מהמערכת.</p>
    </div>
  `
});


  res.status(201).json({ message: 'User invited and email sent.' });
};

export const getAllReports = async (_req: Request, res: Response) => {
  const reports = await ReportLog.find()
    .sort({ createdAt: -1 })
    .populate('user', 'email');
  res.json({ reports });
};
