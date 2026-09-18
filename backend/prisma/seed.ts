import { PrismaClient, Role, CourseLevel, QuestionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LearnOut database seeding...');

  // 1. Clean existing records in reverse dependency order
  console.log('🧹 Cleaning old data...');
  await prisma.examAttemptAnswer.deleteMany({});
  await prisma.examAttempt.deleteMany({});
  await prisma.userQuizAnswer.deleteMany({});
  await prisma.userQuizAttempt.deleteMany({});
  await prisma.userLessonProgress.deleteMany({});
  await prisma.userCourseProgress.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.streakLog.deleteMany({});
  await prisma.option.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.examTryout.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users
  console.log('👤 Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHashAdmin = await bcrypt.hash('admin123', salt);
  const passwordHashUser = await bcrypt.hash('user123', salt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@learnout.id',
      username: 'admin',
      fullName: 'Super Administrator',
      passwordHash: passwordHashAdmin,
      role: Role.ADMIN,
      xp: 2500,
      level: 10,
      streak: 15,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    },
  });

  const demoUser1 = await prisma.user.create({
    data: {
      email: 'budi@learnout.id',
      username: 'budisantoso',
      fullName: 'Budi Santoso',
      passwordHash: passwordHashUser,
      role: Role.USER,
      xp: 450,
      level: 4,
      streak: 3,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=budi',
    },
  });

  const demoUser2 = await prisma.user.create({
    data: {
      email: 'siti@learnout.id',
      username: 'sitirahma',
      fullName: 'Siti Rahma',
      passwordHash: passwordHashUser,
      role: Role.USER,
      xp: 920,
      level: 7,
      streak: 7,
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=siti',
    },
  });

  console.log(`✅ Users created: ${adminUser.username}, ${demoUser1.username}, ${demoUser2.username}`);

  // 3. Seed Achievements (Gamification Badges)
  console.log('🏆 Seeding Gamification Achievements...');
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        code: 'FIRST_LESSON',
        title: 'Langkah Pertama',
        description: 'Selesaikan materi pelajaran pertamamu di LearnOut.',
        iconUrl: 'Sparkles',
        xpBonus: 25,
        category: 'LESSON',
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'STREAK_3_DAYS',
        title: 'Konsistensi Membara',
        description: 'Jaga api streak belajar aktif selama 3 hari berturut-turut.',
        iconUrl: 'Flame',
        xpBonus: 50,
        category: 'STREAK',
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'STREAK_7_DAYS',
        title: 'Pejuang Sejati',
        description: 'Belajar tanpa henti selama 7 hari berturut-turut.',
        iconUrl: 'Flame',
        xpBonus: 100,
        category: 'STREAK',
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'QUIZ_PERFECT',
        title: 'Sempurna!',
        description: 'Raih nilai 100 pada latihan kuis modul.',
        iconUrl: 'Award',
        xpBonus: 75,
        category: 'QUIZ',
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'TRYOUT_FINISHER',
        title: 'Petarung UTBK',
        description: 'Selesaikan simulasi Tryout UTBK berwaktu hingga tuntas.',
        iconUrl: 'GraduationCap',
        xpBonus: 150,
        category: 'EXAM',
      },
    }),
  ]);

  // Give demoUser1 the first two badges
  await prisma.userAchievement.createMany({
    data: [
      { userId: demoUser1.id, achievementId: achievements[0].id },
      { userId: demoUser1.id, achievementId: achievements[1].id },
      { userId: demoUser2.id, achievementId: achievements[0].id },
      { userId: demoUser2.id, achievementId: achievements[1].id },
      { userId: demoUser2.id, achievementId: achievements[2].id },
    ],
  });

  // 4. Seed Categories & Courses
  console.log('📚 Seeding Categories and Courses...');
  const catAkademik = await prisma.category.create({
    data: { name: '🎓 Akademik', slug: 'akademik', description: 'Mata pelajaran akademik sekolah.', icon: 'GraduationCap', orderIndex: 1 },
  });

  const catUtbk = await prisma.category.create({
    data: { name: '📝 UTBK / SNBT', slug: 'utbk-snbt', description: 'Persiapan ujian tulis berbasis komputer.', icon: 'BookOpen', orderIndex: 2 },
  });

  // Akademik Courses
  const courseMath = await prisma.course.create({
    data: { categoryId: catAkademik.id, title: 'Matematika', slug: 'matematika', description: 'Pelajari konsep matematika dari dasar hingga lanjut.', level: CourseLevel.BEGINNER, isPublished: true, orderIndex: 1, thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80' },
  });
  await prisma.course.create({
    data: { categoryId: catAkademik.id, title: 'Fisika', slug: 'fisika', description: 'Memahami fenomena alam dan hukum fisika.', level: CourseLevel.BEGINNER, isPublished: true, orderIndex: 2 },
  });
  await prisma.course.create({
    data: { categoryId: catAkademik.id, title: 'Kimia', slug: 'kimia', description: 'Reaksi kimia dan unsur-unsurnya.', level: CourseLevel.BEGINNER, isPublished: true, orderIndex: 3 },
  });
  await prisma.course.create({
    data: { categoryId: catAkademik.id, title: 'Biologi', slug: 'biologi', description: 'Ilmu tentang kehidupan dan organisme hidup.', level: CourseLevel.BEGINNER, isPublished: true, orderIndex: 4 },
  });

  // UTBK Courses
  const courseUtbk = await prisma.course.create({
    data: { categoryId: catUtbk.id, title: 'Penalaran', slug: 'penalaran', description: 'Penalaran umum dan matematika untuk UTBK.', level: CourseLevel.UTBK, isPublished: true, orderIndex: 1, thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80' },
  });
  await prisma.course.create({
    data: { categoryId: catUtbk.id, title: 'Literasi', slug: 'literasi', description: 'Literasi bahasa Indonesia dan bahasa Inggris.', level: CourseLevel.UTBK, isPublished: true, orderIndex: 2 },
  });
  await prisma.course.create({
    data: { categoryId: catUtbk.id, title: 'Tryout', slug: 'tryout', description: 'Simulasi ujian Tryout UTBK sesungguhnya.', level: CourseLevel.UTBK, isPublished: true, orderIndex: 3 },
  });
  await prisma.course.create({
    data: { categoryId: catUtbk.id, title: 'Bank Soal', slug: 'bank-soal', description: 'Kumpulan soal latihan UTBK tahun-tahun sebelumnya.', level: CourseLevel.UTBK, isPublished: true, orderIndex: 4 },
  });

  // 5. Seed Modules for UTBK Course
  console.log('🧩 Seeding Modules and Lessons...');
  const module1 = await prisma.module.create({
    data: {
      courseId: courseUtbk.id,
      title: 'Modul 1: Penalaran Logika Silogisme & Modus Ponens',
      description: 'Menganalisis premis logis, kesimpulan sah, serta menghindari kecacatan logika (fallacy).',
      orderIndex: 1,
    },
  });

  const module2 = await prisma.module.create({
    data: {
      courseId: courseUtbk.id,
      title: 'Modul 2: Pengetahuan Kuantitatif - Pola Bilangan Bertingkat',
      description: 'Menemukan pola deret aritmatika, geometri bertingkat, dan kombinasi operasi angka.',
      orderIndex: 2,
    },
  });

  // Lessons for Module 1
  const lesson1_1 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Konsep Dasar Silogisme & Premis Mayor-Minor',
      slug: 'konsep-dasar-silogisme-premis',
      orderIndex: 1,
      xpReward: 20,
      durationMinutes: 7,
      content: `### Pengenalan Silogisme Kategorik
Silogisme adalah bentuk penalaran deduktif di mana kesimpulan ditarik dari dua premis yang diberikan.

#### Struktur Utama:
1. **Premis Mayor**: Pernyataan umum yang memuat predikat dari kesimpulan.
2. **Premis Minor**: Pernyataan khusus yang memuat subjek dari kesimpulan.
3. **Kesimpulan (Konklusi)**: Hubungan logis antara subjek dan predikat.

#### Rumus Modus Ponens:
- Premis 1: Jika $P$ maka $Q$ ($P \\rightarrow Q$)
- Premis 2: Terjadi $P$
- Kesimpulan: Maka $Q$

#### Contoh Soal UTBK:
> **Premis 1**: Semua siswa yang rajin latihan soal UTBK memahami tipe soal silogisme.  
> **Premis 2**: Budi adalah siswa yang rajin latihan soal UTBK.  
> **Kesimpulan**: Budi memahami tipe soal silogisme.

*Tips Praktis*: Abaikan kebenaran faktual di dunia nyata, fokus hanya pada validitas struktur argumen yang diberikan!`,
    },
  });

  const lesson1_2 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Menghindari Jebakan Fallacy & Negasi Kalimat Majemuk',
      slug: 'menghindari-jebakan-fallacy',
      orderIndex: 2,
      xpReward: 20,
      durationMinutes: 8,
      content: `### Jebakan Logika Populer dalam UTBK
Salah satu jebakan yang sering muncul adalah **Affirming the Consequent** (Membenarkan Akibat).

#### Contoh Jebakan:
- Premis 1: Jika hujan turun ($P$), maka jalanan basah ($Q$).
- Premis 2: Jalanan basah ($Q$).
- Kesimpulan Salah: Pasti tadi hujan. (Padahal bisa saja jalan disiram air!).

#### Negasi Kuantor (Semua vs Ada):
- Ingkaran dari **"Semua $A$ adalah $B$"** adalah **"Ada/Beberapa $A$ yang BUKAN $B$"**.
- Ingkaran dari **"Ada $A$ yang $B$"** adalah **"Semua $A$ bukan $B$"**.

Pahami aturan negasi ini agar kamu tidak terkecoh pilihan jawaban yang mirip!`,
    },
  });

  // Lessons for Module 2
  const lesson2_1 = await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: 'Trik Pola Deret Aritmatika & Geometri Bertingkat',
      slug: 'trik-deret-aritmatika-bertingkat',
      orderIndex: 1,
      xpReward: 25,
      durationMinutes: 10,
      content: `### Strategi Menaklukkan Pola Angka UTBK
Saat melihat barisan angka, lakukan pengecekan secara berurutan:

1. **Cek Selisih Tingkat 1**: Apakah ada beda konstan $+b$ atau perkalian $\\times r$?
2. **Cek Selisih Bertingkat**: Jika tingkat 1 belum beraturan, hitung selisih dari selisihnya!
3. **Cek Pola Selang-Seling (Larik Ganda)**: Seringkali angka ganjil memiliki pola sendiri, dan angka genap memiliki pola lain.

#### Contoh Analisis:
Barisan: **2, 3, 5, 8, 13, 21, ...**  
Pola: Setiap suku adalah jumlah dari 2 suku sebelumnya (Barisan Fibonacci). Suku berikutnya adalah $13 + 21 = 34$.`,
    },
  });

  // 6. Seed Interactive Quizzes for Modules
  console.log('📝 Seeding Interactive Quizzes and Questions...');
  const quizMod1 = await prisma.quiz.create({
    data: {
      moduleId: module1.id,
      title: 'Kuis Evaluasi: Silogisme & Logika Deduktif',
      description: 'Uji pemahamanmu tentang premis dan penarikan kesimpulan logis.',
      passingScore: 70,
      xpReward: 60,
      orderIndex: 1,
    },
  });

  // Questions for Quiz 1
  const q1 = await prisma.question.create({
    data: {
      quizId: quizMod1.id,
      prompt:
        'Premis 1: Semua mamalia menyusui anaknya.\nPremis 2: Paus adalah mamalia.\nManakah kesimpulan yang paling tepat dan valid?',
      explanation:
        'Berdasarkan silogisme kategorik standar: Subjek (Paus) masuk ke dalam kategori Mayor (Mamalia), sehingga mewarisi sifat dari premis mayor (menyusui anaknya).',
      points: 20,
      type: QuestionType.MULTIPLE_CHOICE,
      orderIndex: 1,
      categoryTag: 'TPS - Penalaran Umum',
    },
  });

  await prisma.option.createMany({
    data: [
      { questionId: q1.id, text: 'Paus menyusui anaknya.', isCorrect: true, orderIndex: 1 },
      { questionId: q1.id, text: 'Sebagian paus menyusui anaknya.', isCorrect: false, orderIndex: 2 },
      { questionId: q1.id, text: 'Hewan yang hidup di air pasti mamalia.', isCorrect: false, orderIndex: 3 },
      { questionId: q1.id, text: 'Paus bukan termasuk ikan bertelur.', isCorrect: false, orderIndex: 4 },
      { questionId: q1.id, text: 'Tidak dapat ditarik kesimpulan.', isCorrect: false, orderIndex: 5 },
    ],
  });

  const q2 = await prisma.question.create({
    data: {
      quizId: quizMod1.id,
      prompt:
        'Premis 1: Jika hari hujan lebat, maka pertandingan sepak bola ditunda.\nPremis 2: Pertandingan sepak bola TIDAK ditunda.\nKesimpulan yang sah berdasarkan aturan Modus Tollens adalah...',
      explanation:
        'Berdasarkan aturan Modus Tollens: Jika P -> Q, dan terjadi ~Q (ingkaran akibat), maka kesimpulannya adalah ~P (Hari tidak hujan lebat).',
      points: 20,
      type: QuestionType.MULTIPLE_CHOICE,
      orderIndex: 2,
      categoryTag: 'TPS - Penalaran Umum',
    },
  });

  await prisma.option.createMany({
    data: [
      { questionId: q2.id, text: 'Hari tidak hujan lebat.', isCorrect: true, orderIndex: 1 },
      { questionId: q2.id, text: 'Hari sedang gerimis kecil.', isCorrect: false, orderIndex: 2 },
      { questionId: q2.id, text: 'Pertandingan dilanjutkan di dalam ruangan.', isCorrect: false, orderIndex: 3 },
      { questionId: q2.id, text: 'Hari hujan lebat tapi lapangan tahan air.', isCorrect: false, orderIndex: 4 },
      { questionId: q2.id, text: 'Wasit memutuskan melanjutkan laga.', isCorrect: false, orderIndex: 5 },
    ],
  });

  const q3 = await prisma.question.create({
    data: {
      quizId: quizMod1.id,
      prompt: 'Manakah ingkaran (negasi) yang tepat dari pernyataan: "Semua peserta UTBK membawa kartu ujian"?',
      explanation:
        'Ingkaran dari pernyataan kuantor universal ("Semua A adalah B") adalah kuantor eksistensial dengan negasi ("Ada/Beberapa A yang BUKAN B").',
      points: 20,
      type: QuestionType.MULTIPLE_CHOICE,
      orderIndex: 3,
      categoryTag: 'TPS - Penalaran Umum',
    },
  });

  await prisma.option.createMany({
    data: [
      { questionId: q3.id, text: 'Beberapa peserta UTBK tidak membawa kartu ujian.', isCorrect: true, orderIndex: 1 },
      { questionId: q3.id, text: 'Semua peserta UTBK tidak membawa kartu ujian.', isCorrect: false, orderIndex: 2 },
      { questionId: q3.id, text: 'Tidak ada satupun peserta yang membawa kartu.', isCorrect: false, orderIndex: 3 },
      { questionId: q3.id, text: 'Sebagian besar peserta lupa membawa kartu ujian.', isCorrect: false, orderIndex: 4 },
      { questionId: q3.id, text: 'Kartu ujian hanya dibawa oleh panitia.', isCorrect: false, orderIndex: 5 },
    ],
  });

  // --- SEED MODULES FOR FONDASI ALJABAR (courseMath) ---
  console.log('📐 Seeding Modules for Fondasi Aljabar...');
  const moduleMathDasar1 = await prisma.module.create({
    data: {
      courseId: courseMath.id,
      title: 'Modul 1: Operasi Bilangan & Sifat Akar/Pangkat',
      description: 'Kembali ke dasar. Pahami operasi eksponen, bentuk akar, dan pecahan tanpa kalkulator.',
      orderIndex: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: moduleMathDasar1.id,
      title: 'Sifat-sifat Eksponen (Pangkat)',
      slug: 'sifat-eksponen',
      orderIndex: 1,
      xpReward: 20,
      durationMinutes: 6,
      content: `### Apa itu Eksponen?
Eksponen atau pangkat adalah perkalian berulang dari suatu bilangan.

#### Sifat-sifat Penting:
1. **Perkalian**: $a^m \\times a^n = a^{m+n}$
   (Contoh: $2^3 \\times 2^4 = 2^7$)
2. **Pembagian**: $a^m / a^n = a^{m-n}$
3. **Pangkat Dipangkatkan**: $(a^m)^n = a^{m \\times n}$
4. **Pangkat Nol**: $a^0 = 1$ (untuk a ≠ 0)
5. **Pangkat Negatif**: $a^{-n} = 1 / a^n$

> **Kesalahan Umum!**
> Jangan tertukar antara $(2+3)^2$ dengan $2^2 + 3^2$.
> Benar: $(2+3)^2 = 5^2 = 25$.
> Salah: $2^2 + 3^2 = 4 + 9 = 13$. (Berbeda!)`,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: moduleMathDasar1.id,
      title: 'Merasionalkan Bentuk Akar',
      slug: 'rasional-bentuk-akar',
      orderIndex: 2,
      xpReward: 25,
      durationMinutes: 8,
      content: `### Mengapa Harus Dirasionalkan?
Dalam matematika, membiarkan bentuk akar di bagian penyebut (bawah pecahan) dianggap tidak "sederhana". Kita harus merasionalkannya.

#### Cara Merasionalkan Akar Tunggal:
Jika bentuknya $a / \\sqrt{b}$, kalikan atas dan bawah dengan $\\sqrt{b}$.
Contoh: $2 / \\sqrt{3} = (2 \\times \\sqrt{3}) / (\\sqrt{3} \\times \\sqrt{3}) = (2\\sqrt{3}) / 3$.

#### Cara Merasionalkan Akar Ganda (Kali Akar Sekawan):
Jika penyebutnya berbentuk $(a + \\sqrt{b})$, maka kalikan dengan **akar sekawannya** yaitu $(a - \\sqrt{b})$.
Konsep ini menggunakan rumus selisih kuadrat: $(x+y)(x-y) = x^2 - y^2$.

> **Latihan Cepat:**
> Rasionalkan $1 / (\\sqrt{5} - \\sqrt{2})$
> Jawab: Kalikan dengan $(\\sqrt{5} + \\sqrt{2}) / (\\sqrt{5} + \\sqrt{2})$.
> Hasil bawahnya menjadi: $5 - 2 = 3$. Hasil akhir: $(\\sqrt{5} + \\sqrt{2}) / 3$.`,
    },
  });

  const quizMathDasar1 = await prisma.quiz.create({
    data: {
      moduleId: moduleMathDasar1.id,
      title: 'Kuis Evaluasi: Eksponen & Akar',
      description: 'Latihan soal hitung cepat eksponen dan merasionalkan akar.',
      passingScore: 75,
      xpReward: 60,
      orderIndex: 1,
    },
  });

  const qMathDasar1 = await prisma.question.create({
    data: {
      quizId: quizMathDasar1.id,
      prompt: 'Berapakah nilai dari (2^3 × 2^5) / 2^6 ?',
      explanation: 'Sifat perkalian: pangkat ditambah (3+5 = 8). Sifat pembagian: pangkat dikurang (8-6 = 2). Maka hasilnya 2^2 = 4.',
      points: 50,
      type: QuestionType.MULTIPLE_CHOICE,
      orderIndex: 1,
      categoryTag: 'Eksponen',
    },
  });
  await prisma.option.createMany({
    data: [
      { questionId: qMathDasar1.id, text: '4', isCorrect: true, orderIndex: 1 },
      { questionId: qMathDasar1.id, text: '2', isCorrect: false, orderIndex: 2 },
      { questionId: qMathDasar1.id, text: '8', isCorrect: false, orderIndex: 3 },
      { questionId: qMathDasar1.id, text: '16', isCorrect: false, orderIndex: 4 },
    ],
  });

  const qMathDasar2 = await prisma.question.create({
    data: {
      quizId: quizMathDasar1.id,
      prompt: 'Bentuk sederhana dari 3 / (√5 + √2) adalah...',
      explanation: 'Kalikan dengan akar sekawan (√5 - √2). Penyebut menjadi (5 - 2) = 3. Maka pembilang 3(√5 - √2) dibagi 3 = √5 - √2.',
      points: 50,
      type: QuestionType.MULTIPLE_CHOICE,
      orderIndex: 2,
      categoryTag: 'Bentuk Akar',
    },
  });
  await prisma.option.createMany({
    data: [
      { questionId: qMathDasar2.id, text: '√5 - √2', isCorrect: true, orderIndex: 1 },
      { questionId: qMathDasar2.id, text: '√5 + √2', isCorrect: false, orderIndex: 2 },
      { questionId: qMathDasar2.id, text: '3(√5 - √2)', isCorrect: false, orderIndex: 3 },
      { questionId: qMathDasar2.id, text: '√3', isCorrect: false, orderIndex: 4 },
    ],
  });

  // 7. Seed UTBK Tryout Simulation Package
  console.log('🎯 Seeding UTBK Tryout Simulation Package...');
  const tryoutUtbk = await prisma.examTryout.create({
    data: {
      title: 'Simulasi UTBK SNBT 2026 - Paket Prediksi Akbar (TPS)',
      slug: 'simulasi-utbk-snbt-2026-paket-1',
      description:
        'Simulasi terstandarisasi UTBK dengan timer 30 menit, fitur ragu-ragu, palet nomor soal, dan rekap nilai akurat.',
      durationMinutes: 30,
      totalQuestions: 5,
      passingScore: 650,
      isPublished: true,
    },
  });

  const tryoutQuestions = [
    {
      prompt:
        'Diketahui barisan angka: 3, 5, 9, 17, 33, ...\nBerapakah angka selanjutnya dalam barisan tersebut?',
      explanation:
        'Pola selisih: +2, +4, +8, +16. Setiap selisih dikali 2. Selisih berikutnya adalah +32. Maka 33 + 32 = 65.',
      options: [
        { text: '65', isCorrect: true },
        { text: '49', isCorrect: false },
        { text: '64', isCorrect: false },
        { text: '67', isCorrect: false },
        { text: '55', isCorrect: false },
      ],
      categoryTag: 'Pengetahuan Kuantitatif',
    },
    {
      prompt:
        'Jika x = 2a + 3 dan y = 4a - 1 dengan a adalah bilangan bulat positif, manakah hubungan yang benar antara kuantitas x dan y?',
      explanation:
        'Untuk a = 1: x = 5, y = 3 (x > y). Untuk a = 2: x = 7, y = 7 (x = y). Untuk a = 3: x = 9, y = 11 (x < y). Karena nilai hubungan berubah tergantung a, informasi tidak cukup.',
      options: [
        { text: 'Hubungan antara kuantitas x dan y tidak dapat ditentukan.', isCorrect: true },
        { text: 'Kuantitas x selalu lebih besar daripada kuantitas y.', isCorrect: false },
        { text: 'Kuantitas y selalu lebih besar daripada kuantitas x.', isCorrect: false },
        { text: 'Kuantitas x sama dengan kuantitas y.', isCorrect: false },
        { text: 'Nilai x dan y selalu negatif.', isCorrect: false },
      ],
      categoryTag: 'Pengetahuan Kuantitatif',
    },
    {
      prompt:
        'Bacalah teks berikut:\n"Pertumbuhan ekonomi digital di Asia Tenggara diproyeksikan melonjak 20% pada tahun 2026 didorong oleh penetrasi kecerdasan buatan dan fintech."\nIde pokok kutipan di atas adalah...',
      explanation:
        'Ide pokok adalah poin sentral yang dibahas dalam kalimat utama, yaitu proyeksi kenaikan pertumbuhan ekonomi digital di Asia Tenggara.',
      options: [
        { text: 'Proyeksi lonjakan pertumbuhan ekonomi digital Asia Tenggara.', isCorrect: true },
        { text: 'Teknologi AI sebagai pengganti seluruh perbankan fisik.', isCorrect: false },
        { text: 'Dampak inflasi dunia terhadap konsumsi fintech.', isCorrect: false },
        { text: 'Tantangan regulasi di pasar Asia Tenggara.', isCorrect: false },
        { text: 'Investasi asing yang menurun drastis.', isCorrect: false },
      ],
      categoryTag: 'Pemahaman Bacaan & Menulis',
    },
    {
      prompt:
        'Premis: Semua atlet profesional menjalani latihan fisik intensif. Sebagian peserta olimpiade matematika adalah atlet profesional.\nKesimpulan yang sah adalah...',
      explanation:
        'Karena sebagian peserta olimpiade matematika adalah atlet profesional, dan seluruh atlet profesional latihan intensif, maka sebagian peserta olimpiade matematika juga menjalani latihan fisik intensif.',
      options: [
        { text: 'Sebagian peserta olimpiade matematika menjalani latihan fisik intensif.', isCorrect: true },
        { text: 'Semua peserta olimpiade matematika menjalani latihan fisik intensif.', isCorrect: false },
        { text: 'Tidak ada peserta olimpiade matematika yang berolahraga.', isCorrect: false },
        { text: 'Hanya atlet yang boleh mengikuti olimpiade sains.', isCorrect: false },
        { text: 'Peserta olimpiade matematika bukan atlet profesional.', isCorrect: false },
      ],
      categoryTag: 'Penalaran Umum',
    },
    {
      prompt:
        'Which of the following best completes the sentence grammatically?\n"Had the students ______ the instructions carefully, they would have scored higher on the test."',
      explanation:
        'Ini adalah Conditional Sentence Type 3 dalam bentuk inversion: "Had + Subject + Past Participle (V3)". Bentuk V3 dari "read" adalah "read" (ejaannya sama).',
      options: [
        { text: 'read', isCorrect: true },
        { text: 'reading', isCorrect: false },
        { text: 'have read', isCorrect: false },
        { text: 'reads', isCorrect: false },
        { text: 'been reading', isCorrect: false },
      ],
      categoryTag: 'Literasi Bahasa Inggris',
    },
  ];

  for (let i = 0; i < tryoutQuestions.length; i++) {
    const qData = tryoutQuestions[i];
    const createdQ = await prisma.question.create({
      data: {
        examTryoutId: tryoutUtbk.id,
        prompt: qData.prompt,
        explanation: qData.explanation,
        points: 20,
        type: QuestionType.MULTIPLE_CHOICE,
        orderIndex: i + 1,
        categoryTag: qData.categoryTag,
      },
    });

    for (let j = 0; j < qData.options.length; j++) {
      const opt = qData.options[j];
      await prisma.option.create({
        data: {
          questionId: createdQ.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          orderIndex: j + 1,
        },
      });
    }
  }

  // --- NEW COURSE: BAHASA INGGRIS ---
  const courseEnglish = await prisma.course.create({
    data: {
      categoryId: catAkademik.id,
      title: 'Bahasa',
      slug: 'bahasa',
      description: 'Tingkatkan kemampuan bahasa Indonesia dan Inggrismu dengan materi Grammar dan Reading.',
      level: CourseLevel.INTERMEDIATE,
      isPublished: true,
      orderIndex: 5,
      thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
    },
  });

  const moduleEng1 = await prisma.module.create({
    data: {
      courseId: courseEnglish.id,
      title: 'Modul 1: Tenses & Sentence Structure',
      description: 'Memahami dasar pembentukan kalimat dalam berbagai waktu (tenses).',
      orderIndex: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: moduleEng1.id,
      title: 'Present Simple vs Present Continuous',
      slug: 'present-simple-vs-continuous',
      orderIndex: 1,
      xpReward: 15,
      durationMinutes: 5,
      content: `### Present Simple vs Present Continuous
Tenses dasar ini sering membingungkan! Mari kita bahas perbedaannya.

#### 1. Present Simple
Digunakan untuk **fakta umum** atau **kebiasaan (rutinitas)**.
- **Pola**: Subject + V1 (s/es) + Object
- **Contoh**: She *works* in a hospital. (Fakta/Pekerjaan tetap)
- **Kata Kunci (Time Signals)**: usually, always, every day, sometimes.

#### 2. Present Continuous
Digunakan untuk aksi yang **sedang terjadi saat ini** atau **sementara**.
- **Pola**: Subject + to be (is/am/are) + V-ing + Object
- **Contoh**: She *is working* on a special project today. (Hanya hari ini/sementara)
- **Kata Kunci**: right now, at the moment, currently, today.

> **Catatan Penting!**
> Beberapa kata kerja (Stative Verbs) tidak boleh ditambahkan -ing. Contohnya: *know, like, want, understand*.
> Salah: I am knowing you. (Benar: I know you).`,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: moduleEng1.id,
      title: 'Past Simple & Past Perfect',
      slug: 'past-simple-and-perfect',
      orderIndex: 2,
      xpReward: 20,
      durationMinutes: 8,
      content: `### Mengurutkan Kejadian di Masa Lalu
Saat menceritakan kejadian masa lalu, kita sering menggunakan kombinasi Past Simple dan Past Perfect.

#### Past Simple
Untuk aksi yang sudah selesai di masa lalu.
- **Pola**: Subject + V2
- **Contoh**: I *arrived* at the station at 8 AM.

#### Past Perfect
Untuk aksi masa lalu yang terjadi **sebelum** aksi masa lalu lainnya terjadi.
- **Pola**: Subject + had + V3
- **Contoh**: The train *had left* when I arrived.

**Visualisasi Waktu (Timeline):**
1. Kereta berangkat (Past Perfect: *had left*)
2. Saya tiba di stasiun (Past Simple: *arrived*)
3. Sekarang (Present)

> *Tips*: Past Perfect adalah "Masa lalunya masa lalu"!`,
    },
  });

  const quizEng1 = await prisma.quiz.create({
    data: {
      moduleId: moduleEng1.id,
      title: 'Kuis Evaluasi: English Tenses',
      description: 'Latihan soal Grammar fokus pada penggunaan tenses dasar dan kombinasi.',
      passingScore: 80,
      xpReward: 50,
      orderIndex: 1,
    },
  });

  const qEng1 = await prisma.question.create({
    data: {
      quizId: quizEng1.id,
      prompt: 'Pilih jawaban yang paling tepat untuk melengkapi kalimat berikut:\n"Shh! The baby _____ right now."',
      explanation: 'Ada penanda waktu "right now" (sekarang), sehingga kita harus menggunakan Present Continuous (is/am/are + V-ing).',
      points: 50,
      type: QuestionType.MULTIPLE_CHOICE,
      orderIndex: 1,
      categoryTag: 'Grammar',
    },
  });
  await prisma.option.createMany({
    data: [
      { questionId: qEng1.id, text: 'is sleeping', isCorrect: true, orderIndex: 1 },
      { questionId: qEng1.id, text: 'sleeps', isCorrect: false, orderIndex: 2 },
      { questionId: qEng1.id, text: 'slept', isCorrect: false, orderIndex: 3 },
      { questionId: qEng1.id, text: 'has slept', isCorrect: false, orderIndex: 4 },
    ],
  });

  const qEng2 = await prisma.question.create({
    data: {
      quizId: quizEng1.id,
      prompt: 'When we arrived at the cinema, the film _____.\n(Fill in the blank with the correct tense)',
      explanation: 'Ada dua kejadian di masa lalu: 1) tiba di bioskop, 2) film sudah mulai duluan. Kejadian yang lebih dulu terjadi (film mulai) menggunakan Past Perfect (had + V3).',
      points: 50,
      type: QuestionType.MULTIPLE_CHOICE,
      orderIndex: 2,
      categoryTag: 'Grammar',
    },
  });
  await prisma.option.createMany({
    data: [
      { questionId: qEng2.id, text: 'had started', isCorrect: true, orderIndex: 1 },
      { questionId: qEng2.id, text: 'has started', isCorrect: false, orderIndex: 2 },
      { questionId: qEng2.id, text: 'started', isCorrect: false, orderIndex: 3 },
      { questionId: qEng2.id, text: 'starts', isCorrect: false, orderIndex: 4 },
    ],
  });

  // Removed Pemrograman and Math Adv as requested by new structure.

  // 8. Seed Sample User Progress for Demo User
  console.log('📈 Seeding Demo User Progress...');
  await prisma.userCourseProgress.create({
    data: {
      userId: demoUser1.id,
      courseId: courseUtbk.id,
      progressPercent: 50,
      isCompleted: false,
    },
  });

  await prisma.userLessonProgress.create({
    data: {
      userId: demoUser1.id,
      lessonId: lesson1_1.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // Seed streak log for the past 3 days
  const today = new Date();
  for (let i = 2; i >= 0; i--) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - i);
    await prisma.streakLog.create({
      data: {
        userId: demoUser1.id,
        date: logDate,
        xpEarned: 50,
      },
    });
  }

  console.log('🎉 LearnOut database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
