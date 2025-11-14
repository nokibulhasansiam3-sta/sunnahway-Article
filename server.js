const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8081;

// In-memory sample data (bn/en/ar)
const categories = [
  { id: 'aqeedah', titleBn: 'আকীদা', titleEn: 'Aqidah', titleAr: 'العقيدة' },
  { id: 'fiqh', titleBn: 'ফিকহ', titleEn: 'Fiqh', titleAr: 'الفقه' },
  { id: 'seerah', titleBn: 'সীরাহ', titleEn: 'Seerah', titleAr: 'السيرة' },
];

const articles = [
  {
    id: 'intro-aqidah-1',
    categoryId: 'aqeedah',
    titleBn: 'আকীদার প্রাথমিক পরিচিতি',
    titleEn: 'Introduction to Aqidah',
    titleAr: 'مقدمة في العقيدة',
    contentBn: 'এটি ডেমো আর্টিকেল। পরে API থেকে ডেটা আসবে।',
    contentEn: 'This is a demo article. API integration will come later.',
    contentAr: 'هذه مقالة تجريبية. سيتم إضافة ربط API لاحقًا.'
  },
  {
    id: 'aqeedah-long-1',
    categoryId: 'aqeedah',
    titleBn: 'আকীদা: ঈমানের মৌলিক ভিত্তি (ডেমো দীর্ঘ আর্টিকেল)',
    titleEn: 'Aqidah: Foundations of Faith (Long Demo Article)',
    titleAr: 'العقيدة: أسس الإيمان (مقال تجريبي طويل)',
    contentBn: `আকীদা হলো ইসলামের মূলভিত্তি। একজন মুসলিমের বিশ্বাস, দৃষ্টিভঙ্গি, চিন্তা-চেতনা—সবকিছুর কেন্দ্রবিন্দু হলো সঠিক আকীদা।
আকীদা সঠিক না হলে ইবাদত, আমল কিংবা দ্বীনের অন্য শাখাগুলো পূর্ণতা পায় না।

ঈমানের ছয়টি স্তম্ভ—আল্লাহ্‌তে ঈমান, ফেরেশতাগণে ঈমান, গ্রন্থসমূহে ঈমান, রাসূলগণে ঈমান, আখেরাতে ঈমান, তাকদীরে ঈমান—
এগুলোই সঠিক আকীদার ভিত্তি স্থাপন করে। প্রতিটি স্তম্ভ গভীরভাবে হৃদয়ঙ্গম করা, তার প্রভাব জীবনে আনা এবং সন্দেহ-সংশয়ের ঊর্ধ্বে থাকা ফরজ।

সঠিক আকীদা অর্জনের জন্য কুরআন ও সহিহ সুন্নাহর বোধগম্যতা অপরিহার্য। সাহাবায়ে কিরামের পদ্ধতি ও উম্মাহর সালফ-সালিহীনের ব্যাখ্যা অনুসরণ করা নিরাপদ পথ।

এই ডেমো আর্টিকেলটি শুধুমাত্র পরীক্ষামূলক কনটেন্ট হিসেবে যোগ করা হয়েছে—পরবর্তীতে এখানে API থেকে বড় ও বিস্তারিত লেখা আসবে ইনশাআল্লাহ।`,
    contentEn: `Aqidah (creed) is the core of Islam. A Muslim’s worldview, worship, and practice all stand on correct belief.
Without sound creed, deeds cannot attain their true value.

The six pillars of faith—belief in Allah, His angels, His books, His messengers, the Last Day, and Divine Decree—
form the foundation of Aqidah. Each pillar must be internalized, lived, and held without doubt.

Understanding the Qur’an and authentic Sunnah, along with the explanations of the Companions and early scholars,
is essential to preserve orthodoxy.

This is a long demo article for testing. In production, content will be loaded from the API.`,
    contentAr: `العقيدة هي أساس الإسلام. تقوم عبادة المسلم وسلوكه ونظرته للحياة على الاعتقاد الصحيح.
بدون عقيدة سليمة لا يبلغ العمل كماله.

أركان الإيمان الستة — الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر —
هي التي تؤسس لبناء العقيدة. يجب ترسيخها في القلب والعمل بمقتضاها دون شك.

فهم القرآن والسنة الصحيحة واتباع منهج الصحابة والسلف الصالح يحفظ الدين من الانحراف.

هذا مقال تجريبي طويل للاختبار، وسيأتي المحتوى لاحقًا من واجهة برمجة التطبيقات.`
  }
];

// Routes
app.get('/articles/categories', (req, res) => {
  res.json(categories);
});

// List by category
app.get('/articles', (req, res) => {
  const { categoryId } = req.query;
  let items = articles;
  if (categoryId) {
    items = items.filter(a => a.categoryId === categoryId);
  }
  // list view (no heavy content) - send only meta
  const light = items.map(a => ({
    id: a.id,
    categoryId: a.categoryId,
    titleBn: a.titleBn,
    titleEn: a.titleEn,
    titleAr: a.titleAr,
  }));
  res.json(light);
});

// Detail
app.get('/articles/:id', (req, res) => {
  const item = articles.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

app.listen(PORT, () => {
  console.log(`Articles API running on http://localhost:${PORT}`);
});
