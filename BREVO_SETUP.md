# 📧 Brevo Newsletter Integration Setup

## 🚀 Step 1: Create Brevo Account

1. Go to [Brevo.com](https://www.brevo.com)
2. Sign up for free account (300 emails/day free tier)
3. Verify your email address

## 🔑 Step 2: Get API Key

1. Login to Brevo dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate a new API key**
4. Copy the API key (starts with `xkeysib-`)

## 📝 Step 3: Create Contact List

1. Go to **Contacts** → **Lists**
2. Click **Create a list**
3. Name it "Islamic Roadmap Newsletter"
4. Note the **List ID** (number in URL after creating)

## ⚙️ Step 4: Configure Environment Variables

Create `.env` file in project root:

```bash
# Brevo Configuration
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_LIST_ID=2
```

**Where to find:**
- **API Key**: Settings → API Keys in Brevo dashboard
- **List ID**: In the URL when viewing your list, or in list settings

## 🧪 Step 5: Test Integration

1. Start development server: `npm run dev`
2. Go to `http://localhost:4321/subscribe`
3. Try subscribing with test email
4. Check Brevo dashboard → Contacts to see new subscriber

## 📊 Step 6: Admin Dashboard

- Visit `/admin/newsletter` to see stats
- Dashboard will show Brevo integration status
- Direct links to Brevo dashboard for advanced management

## 🎯 Brevo Features You Get

### ✅ **Free Tier Benefits:**
- 300 emails/day (9,000/month)
- Unlimited contacts
- Email campaigns
- Basic automation
- Analytics & reporting

### ✅ **Advanced Features:**
- Email templates
- A/B testing
- Segmentation
- GDPR compliance
- SMS marketing (paid)
- Landing pages

## 📋 Newsletter Management Workflow

### **1. Content Creation**
- Use Brevo's drag-drop editor
- Or upload HTML templates
- Preview across devices

### **2. Subscriber Management**
- Auto-sync from website
- Import/export contacts
- Segment by attributes (SOURCE, LANGUAGE, etc.)

### **3. Campaign Analytics**
- Open rates, click rates
- Bounce management
- Unsubscribe tracking
- Geographic data

## 🔧 API Endpoints Created

- `POST /api/newsletter/subscribe` - Add subscriber to Brevo
- `GET /api/newsletter/stats` - Get subscriber statistics

## 💡 Tips for Better Results

### **1. List Hygiene**
- Regular cleanup of bounced emails
- Monitor unsubscribe reasons
- Segment inactive subscribers

### **2. Content Strategy**
- Weekly consistent schedule
- Mobile-first design
- Clear call-to-actions
- Islamic content guidelines

### **3. Compliance**
- Double opt-in recommended
- Clear unsubscribe links
- Privacy policy mention
- GDPR compliance for EU users

## 🚨 Troubleshooting

### **Common Issues:**

**1. API Key Error**
```
Error: Brevo API key not configured
```
- Check `.env` file exists
- Verify API key format
- Restart dev server after adding env vars

**2. List ID Error**
```
Error: List not found
```
- Verify list ID is correct number
- Check list exists in Brevo dashboard
- Ensure API key has proper permissions

**3. Rate Limiting**
```
Error: Too many requests
```
- Brevo free tier has rate limits
- Wait a moment and try again
- Consider upgrading plan for higher limits

## 📈 Upgrade Recommendations

**When to upgrade:**
- More than 300 emails/day needed
- Advanced automation required
- SMS marketing desired
- White-label requirements

**Brevo Pricing:**
- **Free**: 300 emails/day
- **Starter**: $25/month (20K emails)
- **Business**: $65/month (50K emails)
- **Enterprise**: Custom pricing

## 🔗 Useful Links

- [Brevo API Documentation](https://developers.brevo.com/)
- [Brevo Support](https://help.brevo.com/)
- [Brevo Templates](https://www.brevo.com/email-templates/)
- [Islamic Newsletter Best Practices](https://islamicmarketing.com/newsletter-guide)

---

**Ready to send your first newsletter!** 🚀

The integration is complete and your Islamic Roadmap newsletter system is now powered by professional email infrastructure. 