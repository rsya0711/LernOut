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
  const catUtbk = await prisma.category.create({
    data: {
      name: 'UTBK / SNBT 2026',
      slug: 'utbk-snbt',
      description: 'Tes Potensi Skolastik (TPS), Literasi Bahasa, dan Penalaran Matematika.',
      icon: 'GraduationCap',
      orderIndex: 1,
    },
  });

  const catMath = await prisma.category.create({
    data: {
      name: 'Matematika & Logika',
      slug: 'matematika',
      description: 'Fondasi aljabar, kalkulus, geometri, dan pola berpikir analitis.',
      icon: 'BrainCircuit',
      orderIndex: 2,
    },
  });

  const catEnglish = await prisma.category.create({
    data: {
      name: 'Bahasa Inggris',
      slug: 'bahasa-inggris',
      description: 'Grammar mastery, reading comprehension, dan vocabulary booster.',
      icon: 'Globe',
      orderIndex: 3,
    },
  });

  const catProg = await prisma.category.create({
    data: {
      name: 'Pemrograman Web',
      slug: 'programming',
      description: 'JavaScript, TypeScript, React, algoritma pemrograman, dan problem solving.',
      icon: 'Code',
      orderIndex: 4,
    },
  });

  // Course 1: UTBK TPS & Literasi
  const courseUtbk = await prisma.course.create({
    data: {
      categoryId: catUtbk.id,
      title: 'Mastery UTBK TPS & Literasi 2026',
      slug: 'mastery-utbk-tps-literasi-2026',
      description:
        'Kuasai seluruh komponen Tes Potensi Skolastik (TPS): Penalaran Umum, Pengetahuan Kuantitatif, Pemahaman Bacaan & Menulis, serta Literasi Bahasa.',
      level: CourseLevel.UTBK,
      isPublished: true,
      orderIndex: 1,
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    },
  });

  // Course 2: Aljabar & Logika
  const courseMath = await prisma.course.create({
    data: {
      categoryId: catMath.id,
      title: 'Fondasi Aljabar & Penalaran Kuantitatif',
      slug: 'fondasi-aljabar-penalaran-kuantitatif',
      description:
        'Belajar logika matematika dan pola bilangan dari konsep dasar hingga teknik hitung cepat tanpa kalkulator.',
      level: CourseLevel.BEGINNER,
      isPublished: true,
      orderIndex: 2,
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    },
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
