import { Request, Response } from 'express';
import { generateDocFromPrompt } from '../services/aiService';
import { renderPdf } from '../services/pdfService';
import { AuthenticateRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { systemPrompts } from '../utils/systemPrompt';
import { fileToDataUrl } from '../utils/fileToDataUrl';
import { ReportLog } from '../models/reportLog'; 
import path from 'path';
import fs from 'fs';

async function safeFileToDataUrl(filePath: string): Promise<string> {
  try {
    return fileToDataUrl(filePath);
  } catch (err) {
    console.warn(`Missing file at ${filePath}, skipping data URL.`);
    return '';
  }
}

export const makeInvoiceDemandPdfUsingAi = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticateRequest).userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId).select(
      'companyName companyLogo companyAddress companyPhone companyEmail companyWebsite companyPhone2 companyId invoiceCounter'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const aiRaw = await generateDocFromPrompt(prompt, systemPrompts.invoiceDemand);
    const aiResponse = JSON.parse(aiRaw);
    const aiData: Record<string, any> = aiResponse.data ?? aiResponse;

    const data = {
      invoiceNumber: user.invoiceCounter || 1,
      companyName: user.companyName || '',
      companyLogo: user.companyLogo || '',
      companyAddress: user.companyAddress || '',
      companyPhone: user.companyPhone || '',
      companyEmail: user.companyEmail || '',
      companyWebsite: user.companyWebsite || '',
      companyPhone2: user.companyPhone2 || '',
      companyId: user.companyId || '',
      ...aiData,
    };

    let logoSrc = user.companyLogo || '';
    if (logoSrc.startsWith('/uploads/')) {
      logoSrc = await safeFileToDataUrl(logoSrc);
    }

    const pdfBuffer = await renderPdf({
      docType: 'invoiceDemand',
      data,
      header: { logoUrl: logoSrc },
      optional: {},
    });

    user.invoiceCounter = (user.invoiceCounter || 1) + 1;
    await user.save();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=invoice-demand.pdf',
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice demand PDF:', error);
    res.status(500).json({ error: 'Failed to generate invoice demand PDF' });
  }
};

export const makeLeakDetectionPdfUsingAi = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticateRequest).userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId).select(
      'companyName companyLogo companyAddress companyPhone companyEmail companyWebsite companyPhone2 companyId'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { prompt, images: incomingImages } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const aiRaw = await generateDocFromPrompt(prompt, systemPrompts.leakDetection);
    const aiResponse = JSON.parse(aiRaw);
    const aiData: Record<string, any> = aiResponse.data ?? aiResponse;

    const data = {
      ...aiData,
      companyName: user.companyName || '',
      companyLogo: user.companyLogo || '',
      companyAddress: user.companyAddress || '',
      companyPhone: user.companyPhone || '',
      companyEmail: user.companyEmail || '',
      companyWebsite: user.companyWebsite || '',
      companyPhone2: user.companyPhone2 || '',
      companyId: user.companyId || '',
    };

    let logoSrc = user.companyLogo || '';
    if (logoSrc.startsWith('/uploads/')) {
      logoSrc = await safeFileToDataUrl(logoSrc);
    }

    const images: { url: string; description: string }[] = Array.isArray(incomingImages)
      ? incomingImages
      : [];
    const optional: Record<string, any> = {};

    if (images.length) {
      optional.images = [];
      for (const img of images) {
        let imgSrc = img.url;
        if (imgSrc.startsWith('/uploads/')) {
          imgSrc = await safeFileToDataUrl(imgSrc);
        }
        optional.images.push({ url: imgSrc, description: img.description || '' });
      }
    }

    const pdfBuffer = await renderPdf({
      docType: 'leakDetection',
      data,
      header: { logoUrl: logoSrc },
      optional,
    });

    const filename = `leak-${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../../uploads', filename);
    fs.writeFileSync(filepath, pdfBuffer);

    await ReportLog.create({
      user: userId,
      type: 'leak-detection',
      prompt,
      images,
      pdfUrl: `/uploads/${filename}`,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=${filename}`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating leak detection PDF:', error);
    res.status(500).json({ error: 'Failed to generate leak detection PDF' });
  }
};
