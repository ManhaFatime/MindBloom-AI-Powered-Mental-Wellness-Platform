-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 07, 2026 at 01:53 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mindbloom_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `achievement_key` varchar(100) NOT NULL,
  `achievement_title` varchar(160) NOT NULL,
  `achievement_description` varchar(255) NOT NULL,
  `certificate_number` varchar(80) NOT NULL,
  `earned_date` date NOT NULL,
  `status` enum('earned','locked') NOT NULL DEFAULT 'earned',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `user_id`, `achievement_key`, `achievement_title`, `achievement_description`, `certificate_number`, `earned_date`, `status`, `created_at`) VALUES
(1, 20, 'mindbloom_journey_started', 'MindBloom Wellness Journey', 'Awarded for beginning a personal wellness journey with MindBloom.', 'MB-2026-00020-AE73EB7E', '2026-07-23', 'earned', '2026-07-22 20:52:55'),
(2, 24, 'mindbloom_journey_started', 'MindBloom Wellness Journey', 'Awarded for beginning a personal wellness journey with MindBloom.', 'MB-2026-00024-E5B8658A10', '2026-07-23', 'earned', '2026-07-23 03:06:56'),
(3, 25, 'mindbloom_journey_started', 'MindBloom Wellness Journey', 'Awarded for beginning a personal wellness journey with MindBloom.', 'MB-2026-00025-F76EA08E2F', '2026-07-29', 'earned', '2026-07-29 04:14:42');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_history`
--

CREATE TABLE `assessment_history` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `wellness_level` varchar(50) NOT NULL,
  `level_key` varchar(30) DEFAULT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answers`)),
  `ai_summary` text DEFAULT NULL,
  `recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recommendations`)),
  `recommendation_source` enum('ai','fallback') NOT NULL DEFAULT 'fallback',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_history`
--

INSERT INTO `assessment_history` (`id`, `user_id`, `category`, `category_name`, `score`, `wellness_level`, `level_key`, `answers`, `ai_summary`, `recommendations`, `recommendation_source`, `created_at`) VALUES
(1, 24, 'anxiety', 'Anxiety', 57.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Rarely\",\"value\":1}]', 'Your assessment indicates moderate anxiety concerns. You often experience physical symptoms and difficulty concentrating due to worry, and sometimes feel on edge or struggle to relax.', '[\"Practice deep breathing exercises daily to help manage physical anxiety symptoms like shortness of breath or a racing heart.\",\"When your mind feels blank or you struggle to concentrate, try a grounding exercise by focusing on five things you can see, four things you can hear, and three things you can touch.\",\"Integrate short relaxation breaks into your day, such as listening to calming music or doing gentle stretches, to help you unwind.\",\"Notice when you feel on edge or a sense of dread. Acknowledge the feeling without judgment, then gently redirect your attention to a simple task at hand.\",\"Engage in light physical activity like a short walk or yoga to help release physical tension and improve your ability to relax.\"]', 'ai', '2026-07-28 02:25:49'),
(2, 24, 'anxiety', 'Anxiety', 57.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Sometimes\",\"value\":2}]', 'Your assessment shows you manage some aspects of anxiety well, but you often deal with persistent worrying thoughts and noticeable physical symptoms when anxious. It also seems worry can sometimes make it hard to concentrate.', '[\"Try \'worry time\': set a 15-minute daily slot to write down all worries, then try to let them go until next time.\",\"Practice deep belly breathing for 5 minutes daily to soothe your body when anxiety symptoms appear.\",\"Mindfully focus on one task at a time; when worry strikes, gently return attention to the present activity.\",\"Take a daily 20-minute walk or do light physical activity to help release tension and clear your mind.\",\"Keep a simple gratitude journal by listing 3 positive things daily to shift your focus away from worrying thoughts.\"]', 'ai', '2026-07-28 10:44:19'),
(3, 24, 'esteem', 'Self-Esteem', 41.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel that I am not as capable or competent as the people around me.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I am critical or harsh toward myself when I make mistakes.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I doubt my ability to handle challenges or new situations.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I feel uncomfortable receiving compliments or positive feedback.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I compare myself negatively to others.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel that my opinions or contributions are less valuable than those of others.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I find it hard to stand up for myself or express my needs.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I feel a sense of shame or embarrassment about who I am.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I seek approval from others before feeling confident in my choices.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel that I do not deserve good things that happen to me.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel uncomfortable in social situations because I worry about being judged.\",\"answer\":\"Almost Always\",\"value\":4}]', 'Your assessment shows you\'re experiencing moderate challenges with self-esteem, particularly in doubting your capabilities, valuing your contributions, and standing up for yourself, especially in social situations. These feelings are understandable, and we can work on them together.', '[\"Practice expressing your needs: Gently state one small need or preference to a trusted person this week.\",\"Acknowledge your strengths: Each day, write down one skill you possess or a challenge you have successfully navigated.\",\"Accept positive feedback: When someone gives you a compliment, simply say \'Thank you\' without dismissing or explaining it.\",\"Build confidence in new situations: Take a small step outside your comfort zone and celebrate the effort, not just the outcome.\",\"Practice self-compassion: When you feel shame or worry about judgment, pause and offer yourself the same kindness you would a close friend.\"]', 'ai', '2026-07-28 10:44:43'),
(4, 24, 'mood', 'Mood', 48.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel sad, empty, or low without a clear reason.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I have lost interest in activities or hobbies that I used to enjoy.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel hopeless about the future.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I feel disconnected from the people around me.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I notice that it takes extra effort to do basic daily tasks.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I feel that I am a burden to the people in my life.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I find little or nothing to look forward to during my week.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"My mood changes noticeably from one part of the day to another.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel emotionally numb or flat, neither happy nor sad.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"Positive events or good news have little effect on how I feel.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel tearful or on the verge of crying without a specific trigger.\",\"answer\":\"Sometimes\",\"value\":2}]', 'Your answers highlight struggles with feelings of hopelessness, disconnection from others, and extra effort needed for daily tasks, even without constant sadness, suggesting focused self-care could be beneficial.', '[\"Reach out to one trusted friend or family member this week, even for a short chat, to help feel less disconnected.\",\"Pick one small daily task you\'ve found hard and break it into tiny steps to make it feel more manageable.\",\"Think of one tiny, simple thing you could look forward to this week, like a favorite snack or a song.\",\"Try doing one small activity you used to enjoy for just 5-10 minutes, without pressure to feel good about it.\",\"Spend a few minutes gently noticing how you feel each day, without judgment, perhaps by writing it down.\"]', 'ai', '2026-07-28 11:16:21'),
(5, 24, 'esteem', 'Self-Esteem', 73.00, 'Generally Stable', 'stable', '[{\"question\":\"I feel that I am not as capable or competent as the people around me.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I am critical or harsh toward myself when I make mistakes.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I doubt my ability to handle challenges or new situations.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel uncomfortable receiving compliments or positive feedback.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I compare myself negatively to others.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that my opinions or contributions are less valuable than those of others.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it hard to stand up for myself or express my needs.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel a sense of shame or embarrassment about who I am.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I seek approval from others before feeling confident in my choices.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel that I do not deserve good things that happen to me.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel uncomfortable in social situations because I worry about being judged.\",\"answer\":\"Rarely\",\"value\":1}]', 'Your self-esteem is stable, showing a strong sense of self. A gentle area for growth could be focusing on your own path rather than comparing yourself to others.', '[\"When you notice yourself comparing, try to shift your focus back to your own strengths.\",\"Remind yourself that everyone\'s journey and pace are different.\",\"Limit exposure to things that make you feel the need to compare.\",\"Practice positive self-talk about your unique qualities.\",\"Celebrate your progress and small achievements regularly.\"]', 'ai', '2026-07-28 11:32:24'),
(6, 24, 'mood', 'Mood', 91.00, 'Strong Wellness', 'strong', '[{\"question\":\"I feel sad, empty, or low without a clear reason.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I have lost interest in activities or hobbies that I used to enjoy.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel hopeless about the future.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel disconnected from the people around me.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I notice that it takes extra effort to do basic daily tasks.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel that I am a burden to the people in my life.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I find little or nothing to look forward to during my week.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"My mood changes noticeably from one part of the day to another.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel emotionally numb or flat, neither happy nor sad.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"Positive events or good news have little effect on how I feel.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel tearful or on the verge of crying without a specific trigger.\",\"answer\":\"Never\",\"value\":0}]', 'Your mood wellness is very strong, showing great resilience and a consistently positive outlook. Keep up the excellent work in maintaining these healthy habits.', '[\"Celebrate Small Victories: Keep noticing and celebrating the little good things each day to boost your mood.\",\"Nurture Your Connections: Continue to make time for friends and family to strengthen your support network.\",\"Reflect on Positives: Regularly take a moment to think about what went well or what you\'re grateful for.\",\"Stay Engaged with Hobbies: Keep pursuing your passions and activities that bring you joy and a sense of purpose.\",\"Maintain Your Energy: Continue your healthy routines to ensure you have consistent energy for daily life.\"]', 'ai', '2026-07-28 11:33:15'),
(7, 20, 'stress', 'Stress', 55.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel overwhelmed by the demands placed on me each day.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I find it hard to keep up with my responsibilities or obligations.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel irritable or short-tempered when things do not go as planned.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel like I do not have enough time to get things done.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I notice tension in my body, such as tight shoulders, a clenched jaw, or headaches.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel like I am unable to unwind after a stressful day.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it difficult to make decisions because of how much I have on my mind.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"Small problems or setbacks feel much bigger than they probably are.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel mentally exhausted even when I have not done much physical activity.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"My mood is negatively affected by the demands or pressures in my life.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I feel that I am losing control over how I manage things in my life.\",\"answer\":\"Almost Always\",\"value\":4}]', 'Your assessment shows moderate stress concerns, particularly around feeling short on time, managing daily demands, and how these pressures affect your mood and sense of control. Focusing on planning and mindful breaks can help.', '[\"Identify your top 1-3 priorities each day to focus your efforts and manage your time better.\",\"Schedule short, regular breaks to practice deep breathing or gentle stretching to release physical tension.\",\"Practice saying \'no\' to new commitments when your schedule is already full to prevent feeling overwhelmed.\",\"Dedicate a short time weekly to plan your key tasks and obligations, helping you feel more in control.\",\"Notice when demands affect your mood and step away briefly to clear your head before continuing.\"]', 'ai', '2026-07-28 13:06:39'),
(8, 24, 'sleep', 'Sleep Quality', 66.00, 'Generally Stable', 'stable', '[{\"question\":\"I have difficulty falling asleep at night.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I wake up during the night and find it hard to get back to sleep.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I wake up earlier than I want to and cannot return to sleep.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel unrefreshed or tired in the morning, even after sleeping.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"My sleep is disturbed by racing thoughts or worry.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel sleepy or low on energy during the day because of poor sleep.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I find that my mood or ability to concentrate is affected by how well I slept.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I rely on caffeine or sleep aids to manage my sleep.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"My sleep schedule is irregular, and I go to bed or wake up at very different times.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I have vivid, distressing, or unusual dreams that interfere with my rest.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel anxious or worried about not getting enough sleep.\",\"answer\":\"Sometimes\",\"value\":2}]', 'Your sleep quality is stable, which is a great foundation! We noticed you sometimes have trouble falling asleep and often feel sleepy during the day, which can impact your mood and focus. Let\'s explore some gentle ways to help you drift off more easily and wake up feeling more refreshed.', '[\"Try creating a relaxing bedtime routine, like reading or a warm bath, to help you wind down.\",\"Aim for consistent sleep and wake-up times every day, even on weekends, to regulate your body clock.\",\"Expose yourself to natural light soon after waking up to signal to your body that it\'s daytime.\",\"Limit screen time from phones or tablets at least an hour before you plan to sleep.\",\"Incorporate regular physical activity into your day, but try to avoid intense workouts close to bedtime.\"]', 'ai', '2026-07-29 02:18:45'),
(9, 25, 'anxiety', 'Anxiety', 50.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Rarely\",\"value\":1}]', 'Your assessment shows moderate anxiety concerns, particularly with feeling on edge, avoiding situations due to nervousness, difficulty relaxing, and a persistent sense of dread. Taking small, consistent steps can help you manage these feelings.', '[\"Practice deep breathing exercises for 5-10 minutes daily to help calm your body and mind.\",\"When you feel a sense of dread, try a \'5-4-3-2-1\' grounding technique to focus on your surroundings.\",\"Choose one small social activity you\'ve been avoiding and plan to do it this week.\",\"Reduce caffeine and ensure a regular sleep schedule to help lessen feeling on edge.\",\"Set aside 15 minutes each day to write down any worries, then put them away until the next \'worry time\'.\"]', 'ai', '2026-07-29 03:07:26'),
(10, 20, 'stress', 'Stress', 59.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel overwhelmed by the demands placed on me each day.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it hard to keep up with my responsibilities or obligations.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel irritable or short-tempered when things do not go as planned.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel like I do not have enough time to get things done.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I notice tension in my body, such as tight shoulders, a clenched jaw, or headaches.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel like I am unable to unwind after a stressful day.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"I find it difficult to make decisions because of how much I have on my mind.\",\"answer\":\"Almost Always\",\"value\":4},{\"question\":\"Small problems or setbacks feel much bigger than they probably are.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel mentally exhausted even when I have not done much physical activity.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"My mood is negatively affected by the demands or pressures in my life.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel that I am losing control over how I manage things in my life.\",\"answer\":\"Sometimes\",\"value\":2}]', 'Your responses suggest that this area may need some gentle attention.', '[\"Take a few slow breaths when you feel overwhelmed.\",\"Write down your thoughts and feelings each day.\",\"Follow a regular sleep and wake-up routine.\",\"Choose one small wellness activity to complete today.\",\"Speak with someone you trust when you need support.\"]', 'fallback', '2026-07-31 12:04:14'),
(11, 20, 'anxiety', 'Anxiety', 64.00, 'Generally Stable', 'stable', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Sometimes\",\"value\":2}]', 'Your responses suggest a mostly stable condition with a few areas that may need attention.', '[\"Practice slow breathing for five minutes when worry feels intense.\",\"Use the 5-4-3-2-1 grounding technique to reconnect with the present moment.\",\"Write down repeated worries and separate what you can control from what you cannot.\",\"Choose one recommendation and practice it consistently this week.\",\"Track your progress and notice any small positive changes.\"]', 'fallback', '2026-08-01 07:12:19'),
(12, 20, 'anxiety', 'Anxiety', 57.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Sometimes\",\"value\":2}]', 'Your assessment shows that you sometimes feel worry, which can make it hard to relax or focus on daily tasks. It\'s a moderate concern, and small, consistent actions can help you feel better.', '[\"Practice mindful breathing: When worries arise, take a few slow, deep breaths to help calm your mind and body.\",\"Schedule \'worry time\': Dedicate 10-15 minutes each day to write down and think about your worries, then try to let them go for the rest of the day.\",\"Break tasks into steps: If dread or worry makes you avoid tasks, break them into tiny, manageable steps to make starting easier.\",\"Ground yourself: When thoughts race or you feel on edge, focus on your five senses to bring your attention back to the present moment.\",\"Move your body gently: Even a short walk or some light stretching can help release physical tension and clear your mind.\"]', 'ai', '2026-08-01 07:25:39'),
(13, 20, 'anxiety', 'Anxiety', 73.00, 'Generally Stable', 'stable', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Rarely\",\"value\":1}]', 'Your wellness score of 73 indicates a stable level regarding anxiety. While you manage well overall, some areas like occasional worry, difficulty relaxing, and noticing physical tension could benefit from gentle attention to support even greater calm.', '[\"Try deep breathing for a few minutes each day to help ease any physical tension you might feel.\",\"When you find it hard to stop worrying, try setting aside a specific \'worry time\' for those thoughts.\",\"Practice a simple grounding exercise, like noticing 5 things you can see, to help when you feel on edge.\",\"Gently question worrying thoughts by asking yourself if they are facts or just possibilities.\",\"Incorporate a relaxing activity into your evening routine, such as reading or listening to calm music, to help unwind.\"]', 'ai', '2026-08-01 07:44:32'),
(14, 20, 'anxiety', 'Anxiety', 68.00, 'Generally Stable', 'stable', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Rarely\",\"value\":1}]', 'Your responses suggest a mostly stable condition with a few areas that may need attention.', '[\"Practice slow breathing for five minutes when worry feels intense.\",\"Use the 5-4-3-2-1 grounding technique to reconnect with the present moment.\",\"Write down repeated worries and separate what you can control from what you cannot.\",\"Choose one recommendation and practice it consistently this week.\",\"Track your progress and notice any small positive changes.\"]', 'fallback', '2026-08-01 08:49:40'),
(15, 20, 'anxiety', 'Anxiety', 52.00, 'Moderate Concern', 'moderate', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Often\",\"value\":3},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Often\",\"value\":3}]', 'Your responses suggest that this area may currently need regular attention.', '[\"Practice slow breathing for five minutes when worry feels intense.\",\"Use the 5-4-3-2-1 grounding technique to reconnect with the present moment.\",\"Write down repeated worries and separate what you can control from what you cannot.\",\"Choose one recommendation and practice it consistently this week.\",\"Track your progress and notice any small positive changes.\"]', 'fallback', '2026-08-01 08:50:44'),
(16, 20, 'anxiety', 'Anxiety', 73.00, 'Generally Stable', 'stable', '[{\"question\":\"I feel a sense of worry or unease that I cannot easily explain.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"My heart races or I notice physical tension when I am not doing anything strenuous.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it hard to stop thinking about things that might go wrong.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel on edge or easily startled by small things.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I avoid situations or activities because of feelings of nervousness or fear.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I experience physical symptoms such as sweating, dizziness, or shortness of breath when I feel anxious.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I notice my mind going blank or having difficulty concentrating due to worry.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel a sense of dread about upcoming events or situations, even minor ones.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it difficult to relax, even when I have free time.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that something bad is about to happen, without a clear reason.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"Worrying thoughts get in the way of my daily tasks or activities.\",\"answer\":\"Never\",\"value\":0}]', 'Your assessment indicates a stable level of wellness regarding anxiety, which is a great foundation. While you manage well overall, there are a few areas where you sometimes experience unease, and focusing on these can help you feel even more calm and relaxed.', '[\"When you feel on edge or easily startled, try a quick grounding exercise like focusing on 5 things you see, 4 you hear, 3 you feel.\",\"If you find yourself avoiding situations due to nervousness, take a small, gentle step towards facing one of them.\",\"Practice deep belly breathing for a few minutes daily to help calm physical tension or a racing heart.\",\"To help relax, schedule short breaks for calming activities like listening to music or gentle stretching.\",\"Gently observe what situations make you feel restless and explore small ways to manage those moments.\"]', 'ai', '2026-08-01 09:00:37'),
(17, 20, 'stress', 'Stress', 80.00, 'Strong Wellness', 'strong', '[{\"question\":\"I feel overwhelmed by the demands placed on me each day.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I find it hard to keep up with my responsibilities or obligations.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel irritable or short-tempered when things do not go as planned.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel like I do not have enough time to get things done.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I notice tension in my body, such as tight shoulders, a clenched jaw, or headaches.\",\"answer\":\"Never\",\"value\":0},{\"question\":\"I feel like I am unable to unwind after a stressful day.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I find it difficult to make decisions because of how much I have on my mind.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"Small problems or setbacks feel much bigger than they probably are.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"I feel mentally exhausted even when I have not done much physical activity.\",\"answer\":\"Rarely\",\"value\":1},{\"question\":\"My mood is negatively affected by the demands or pressures in my life.\",\"answer\":\"Sometimes\",\"value\":2},{\"question\":\"I feel that I am losing control over how I manage things in my life.\",\"answer\":\"Sometimes\",\"value\":2}]', 'You are doing a fantastic job managing stress, showing great strength in handling daily demands. Your wellness score is strong, indicating you have excellent coping strategies in place. By continuing to be mindful of how demands sometimes affect your mood and feelings of control, you can maintain your strong foundation.', '[\"Keep celebrating your effective ways of managing daily demands.\",\"Continue your current healthy routines that help you de-stress.\",\"Notice what sometimes affects your mood and plan mood-boosting breaks.\",\"Regularly review your priorities to maintain a strong sense of control.\",\"Keep setting healthy boundaries to protect your energy and time.\"]', 'ai', '2026-09-04 15:49:09');

-- --------------------------------------------------------

--
-- Table structure for table `chat_conversations`
--

CREATE TABLE `chat_conversations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_conversations`
--

INSERT INTO `chat_conversations` (`id`, `user_id`, `title`, `created_at`, `updated_at`) VALUES
(1, 25, 'I\'m doing okay', '2026-09-05 12:10:48', '2026-09-05 12:10:52'),
(7, 20, 'I feel anxious', '2026-09-06 15:26:50', '2026-09-06 15:26:57');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sender` enum('user','bot') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `conversation_id`, `user_id`, `sender`, `message`, `created_at`) VALUES
(1, 1, 25, 'user', 'I\'m doing okay', '2026-09-05 12:10:48'),
(2, 1, 25, 'bot', 'That\'s good to hear. It\'s perfectly fine to feel just \'okay\'.', '2026-09-05 12:10:52'),
(19, 7, 20, 'user', 'I feel anxious', '2026-09-06 15:26:50'),
(20, 7, 20, 'bot', 'It sounds like you\'re feeling anxious right now. Perhaps trying a simple breathing exercise, like inhaling for four counts and exhaling for six, could help calm your mind. Remember to be kind to yourself through this.', '2026-09-06 15:26:54'),
(21, 7, 20, 'user', 'I\'m doing okay', '2026-09-06 15:26:55'),
(22, 7, 20, 'bot', 'It\'s good to hear you\'re doing okay now. Sometimes, even small shifts in how we feel can make a big difference in our day. Perhaps taking a moment to notice what feels \'okay\' right now could help you recognize your strengths. You\'re doing great, and remember, I\'m here for you.', '2026-09-06 15:26:57');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `fullname` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `subject` varchar(180) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read') NOT NULL DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `user_id`, `fullname`, `email`, `subject`, `message`, `status`, `created_at`) VALUES
(1, NULL, 'bablu', 'manhalearning2712@gmail.com', 'how are u ?', 'figure out plzzz', 'read', '2026-07-22 20:41:47'),
(2, NULL, 'manha', 'manhafatima2712@gmail.com', 'how are u ?', 'hello my name is manha', 'read', '2026-07-31 11:45:23');

-- --------------------------------------------------------

--
-- Table structure for table `daily_challenges`
--

CREATE TABLE `daily_challenges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `challenge_text` varchar(255) NOT NULL,
  `answer` text DEFAULT NULL,
  `challenge_date` date NOT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_challenges`
--

INSERT INTO `daily_challenges` (`id`, `user_id`, `challenge_text`, `answer`, `challenge_date`, `completed_at`) VALUES
(1, 17, 'Write down one thing you handled well today.', NULL, '2026-07-13', '2026-07-13 02:15:19'),
(2, 18, 'Write down one thing you handled well today.', NULL, '2026-07-13', '2026-07-13 14:32:43'),
(3, 19, 'Write down one thing you handled well today.', 'BOOK READING', '2026-07-13', '2026-07-13 14:58:25');

-- --------------------------------------------------------

--
-- Table structure for table `gratitude_entries`
--

CREATE TABLE `gratitude_entries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `entry_one` text NOT NULL,
  `entry_two` text NOT NULL,
  `entry_three` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gratitude_entries`
--

INSERT INTO `gratitude_entries` (`id`, `user_id`, `entry_one`, `entry_two`, `entry_three`, `created_at`) VALUES
(1, 17, 'All the supports provided by Mindbloom.', 'the assessment and activities function made me slime', 'Person, Imran khan\nPlace, Makkah\nMoment, when I first time open MindBloom', '2026-07-12 23:29:11'),
(2, 18, 'MInbloom', 'Dreams', 'Friend, Makkah, When I first time use Mindbloom AI', '2026-07-13 13:50:06'),
(3, 20, 'car', 'playing cricket', 'friend', '2026-08-01 07:14:51');

-- --------------------------------------------------------

--
-- Table structure for table `mindfulness_entries`
--

CREATE TABLE `mindfulness_entries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `seen_items` text NOT NULL,
  `felt_items` text NOT NULL,
  `heard_items` text NOT NULL,
  `smelled_items` text NOT NULL,
  `tasted_item` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mindfulness_entries`
--

INSERT INTO `mindfulness_entries` (`id`, `user_id`, `seen_items`, `felt_items`, `heard_items`, `smelled_items`, `tasted_item`, `created_at`) VALUES
(1, 17, 'loin | turkey | Malaysia | USA | Makkah', 'snow fall | Loin | Snake | Mountans', 'My Friend | My sister | my wife', 'fish | chicken', 'Stack', '2026-07-13 00:53:09');

-- --------------------------------------------------------

--
-- Table structure for table `mood_entries`
--

CREATE TABLE `mood_entries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mood` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mood_entries`
--

INSERT INTO `mood_entries` (`id`, `user_id`, `mood`, `note`, `created_at`) VALUES
(2, 19, 'Very Happy', '', '2026-07-13 15:39:43'),
(3, 20, 'Calm', '', '2026-07-21 20:26:09'),
(4, 24, 'Calm', 'i feell calm', '2026-07-23 09:11:49'),
(5, 24, 'Very Happy', '', '2026-07-26 16:27:11'),
(6, 24, 'Calm', '', '2026-07-26 16:30:15'),
(7, 24, 'Neutral', '', '2026-07-26 16:34:12');

-- --------------------------------------------------------

--
-- Table structure for table `positive_thoughts`
--

CREATE TABLE `positive_thoughts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `negative_thought` text NOT NULL,
  `positive_thought` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positive_thoughts`
--

INSERT INTO `positive_thoughts` (`id`, `user_id`, `negative_thought`, `positive_thought`, `created_at`) VALUES
(1, 17, 'Cloud I do good for living in my future?', 'It\'s completely understandable to wonder about your future and your potential to thrive. You have the capacity to learn, adapt, and build a fulfilling life, making a positive difference along the way. Perhaps you could think about one small step you can take today towards a skill or interest you value.', '2026-07-13 00:07:25');

-- --------------------------------------------------------

--
-- Table structure for table `reflection_entries`
--

CREATE TABLE `reflection_entries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mood` varchar(50) NOT NULL,
  `reflection` text NOT NULL,
  `ai_response` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reflection_entries`
--

INSERT INTO `reflection_entries` (`id`, `user_id`, `mood`, `reflection`, `ai_response`, `created_at`) VALUES
(1, 17, 'Calm', 'no bed, i do so much activities today, like: playing cricket or made bbq and had a goo dinner with my family...', 'Hello! I\'m Bloom AI, your friendly mental wellness companion. How are you feeling today? I\'m here to listen and support you.', '2026-07-12 23:41:30'),
(2, 17, 'Neutral', 'Good, i do so much activities today.', 'Mera naam Bloom AI hai. Main yahan aapki madad ke liye hun.', '2026-07-12 23:44:09'),
(3, 17, 'Sad', 'Really Bed, my grand pa diet before some hours, i feel so bed for him', 'I\'m so sorry to hear about your grandpa. It\'s completely understandable to feel so sad and heartbroken right now. It truly shows how much love you had for him, and it\'s okay to let yourself feel those emotions. Perhaps remembering a happy memory with him could offer a small moment of comfort.', '2026-07-12 23:54:33'),
(4, 20, 'Stressed', 'i am soo stressed today', 'It sounds like you\'re feeling a lot of stress today. It\'s really good that you\'re taking the time to acknowledge how you feel. Maybe try taking a few deep breaths, or stepping away for a short break. You\'re doing great by checking in with yourself.', '2026-07-21 21:10:40'),
(5, 24, 'Calm', 'I feel calm', 'It\'s wonderful that you\'re feeling calm today. That\'s a lovely state to be in. Perhaps you could find a quiet moment to truly appreciate this tranquility. Keep nurturing these peaceful moments.', '2026-07-23 09:34:24'),
(6, 20, 'Calm', 'I feel calm', 'It\'s wonderful that you\'re feeling calm today. This peaceful feeling can be a great foundation for your day. Perhaps you could take a moment to simply savor this calm. Keep nurturing these positive moments.', '2026-08-01 07:28:11'),
(7, 20, 'Neutral', 'I feel Neutral', 'It sounds like you\'re feeling neutral today. Sometimes, a neutral mood can be a quiet moment of calm in the day. Perhaps you could take a moment to simply observe what that feels like. Remember, all feelings are valid, and it\'s okay to just be.', '2026-08-01 08:53:13');

-- --------------------------------------------------------

--
-- Table structure for table `reminders`
--

CREATE TABLE `reminders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reminder_type` enum('exercise','assessment','general') NOT NULL DEFAULT 'general',
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `reminder_date` date NOT NULL,
  `reminder_time` time DEFAULT NULL,
  `status` enum('pending','completed') NOT NULL DEFAULT 'pending',
  `email_sent` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reminders`
--

INSERT INTO `reminders` (`id`, `user_id`, `reminder_type`, `title`, `description`, `reminder_date`, `reminder_time`, `status`, `email_sent`, `created_at`) VALUES
(2, 24, 'general', 'exercise', '', '2026-07-24', '04:20:00', 'completed', 0, '2026-07-22 19:16:48'),
(3, 24, 'assessment', 'walk', '', '2026-07-26', '13:00:00', 'completed', 0, '2026-07-22 19:24:28'),
(4, 20, 'assessment', 'breathing exercise', 'talk to your best friend and feel calm', '2026-07-29', '07:00:00', 'completed', 0, '2026-07-28 13:08:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `role`, `created_at`, `profile_image`) VALUES
(18, 'Hashir', 'hashirsiddiqui@gmail.com', '$2y$10$0OQvazLPpyOkpE16y4NJfOTtCO1KoV/woBF1cxqcTagukRIHZs61a', 'user', '2026-07-13 13:39:48', 'uploads/profiles/1783949988_3570.jpg'),
(20, 'manha', 'manha@gmail.com', '$2y$10$.PMIDhjeiMCeo6oNBfaiIe3QKW.yaNbedQayoJkrrWYqsDLIZLntu', 'user', '2026-07-21 09:55:27', 'uploads/profiles/1784627727_8608.jpg'),
(21, 'MindBloom Administrator', 'admin@mindbloom.com', '$2y$10$Ghsja.PNf8usOxC9HUs6Auyau7.XZ9cRU4Cz7LPi47cNyA.Td2ngS', 'admin', '2026-07-21 10:17:34', 'uploads/profiles/admin_profile_6a663b42eb66c8.99860958.jpg'),
(23, 'sara', 'sara@gmail.com', '$2y$10$ufWqOEAzo4onCaMGygpsOeYE87cnVkpEFYkQua97rUmxNVOeuGfVC', 'user', '2026-07-21 12:18:04', ''),
(24, 'fatima manha', 'manhalearning2712@gmail.com', '$2y$10$XlaYhOLsO5nBp6StdKoL3ez1no0mhHY34QqldaP9/9a4OScTMg4RW', 'user', '2026-07-22 16:31:22', 'uploads/profiles/user_profile_6a61e45ea98078.50422293.jpg'),
(25, 'hashir', 'hashir@gmail.com', '$2y$10$HsHhsOZbAoX34GYs2ODGx.XcvJCfZEQDtViTlor7rXebpc8Kgv6Ly', 'user', '2026-07-29 03:06:28', 'uploads/profiles/user_profile_6a697e1d4d87a4.18430610.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `wellness_hub_posts`
--

CREATE TABLE `wellness_hub_posts` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `slug` varchar(220) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `category` varchar(100) NOT NULL,
  `short_description` varchar(350) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `author` varchar(150) NOT NULL DEFAULT 'MindBloom Wellness Team',
  `reading_time` varchar(30) NOT NULL DEFAULT '5 min',
  `status` enum('published','draft') NOT NULL DEFAULT 'published',
  `published_at` datetime DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wellness_hub_posts`
--

INSERT INTO `wellness_hub_posts` (`id`, `admin_id`, `slug`, `title`, `category`, `short_description`, `content`, `image`, `author`, `reading_time`, `status`, `published_at`, `created_at`, `updated_at`) VALUES
(1, NULL, 'grounding-techniques', '5 Grounding Techniques That Work in Under a Minute', 'Anxiety', 'Calm a racing mind anywhere — from a packed subway to your office chair.', 'Grounding techniques help bring your attention back to the present moment when anxiety feels overwhelming.\n\nThe first technique is the 5-4-3-2-1 method. Notice five things you can see, four things you can touch, three things you can hear, two things you can smell, and one thing you can taste.\n\nThe second technique is slow breathing. Inhale gently for four seconds, hold for four seconds, and exhale for four seconds.\n\nThe third technique is touching a nearby object and noticing its texture, temperature, shape, and weight.\n\nThe fourth technique is naming your current location, the date, and three things you know are true right now.\n\nThe fifth technique is pressing both feet firmly into the floor and noticing the support beneath you.\n\nThese techniques do not remove every anxious feeling, but they can help your body and mind feel safer in the moment.', 'uploads/wellness_hub/grounding.jpg', 'MindBloom Wellness Team', '5 min', 'published', '2026-07-12 10:00:00', '2026-07-22 22:14:05', '2026-07-22 22:14:05'),
(2, NULL, 'stress-recovery-loop', 'The Science of the Stress-Recovery Loop', 'Stress', 'Why your nervous system needs rest as deliberately as effort.', 'Stress is a natural response that helps the body react to challenges.\n\nThe problem begins when the body stays in a stressed state without enough time to recover.\n\nRecovery can include sleep, slow breathing, movement, quiet time, supportive conversations, and enjoyable activities.\n\nShort recovery breaks during the day can help reduce physical tension and improve concentration.\n\nTry working for a focused period and then taking a few minutes to stretch, breathe, or step outside.\n\nRest is not laziness. It is part of the process that allows the mind and body to function well.', 'uploads/wellness_hub/stress.jpg', 'Dr. Emma Clarke', '8 min', 'published', '2026-07-10 10:00:00', '2026-07-22 22:14:05', '2026-07-22 22:14:05'),
(3, NULL, 'wind-down-routine', 'Your Wind-Down Routine, Designed by a Sleep Coach', 'Sleep', 'A 30-minute ritual to slip into deeper rest, naturally.', 'A consistent wind-down routine tells your body that the active part of the day is ending.\n\nStart by lowering bright lights and reducing screen use around thirty minutes before bed.\n\nPrepare your room by keeping it quiet, comfortable, and slightly cool.\n\nChoose one calming activity such as reading, stretching, journaling, or listening to soft audio.\n\nTry to avoid heavy meals and caffeine close to bedtime.\n\nA routine does not need to be perfect. Repeating a few simple steps every night can gradually improve sleep.', 'uploads/wellness_hub/sleep-routine.jpg', 'Sophia Reed', '6 min', 'published', '2026-07-08 10:00:00', '2026-07-22 22:14:05', '2026-07-22 22:14:05'),
(4, NULL, 'loving-kindness-meditation', 'A Beginner\'s Guide to Loving-Kindness', 'Meditation', 'How to befriend yourself in five guided steps.', 'Loving-kindness meditation is a gentle practice that encourages compassion toward yourself and others.\n\nSit comfortably and take a few slow breaths.\n\nBegin by silently repeating: May I be safe. May I be peaceful. May I be healthy. May I live with ease.\n\nNext, think of someone you care about and repeat the same wishes for them.\n\nYou can slowly expand the practice to include neutral people and even people with whom you have difficulty.\n\nThe goal is not to force a feeling. The goal is to practice a kinder direction of attention.', 'uploads/wellness_hub/meditation.jpg', 'Maya Bennett', '7 min', 'published', '2026-07-06 10:00:00', '2026-07-22 22:14:05', '2026-07-22 22:14:05'),
(5, NULL, 'reframing-negative-thoughts', 'Reframing: Turning \'I Can\'t\' into \'I\'m Learning\'', 'Positivity', 'Small language shifts that rewire how you feel.', 'The words we use can influence how we understand difficult situations.\n\nInstead of saying, \'I cannot do this,\' try saying, \'I am still learning how to do this.\'\n\nInstead of saying, \'I always fail,\' try saying, \'This attempt did not work, and I can learn from it.\'\n\nReframing does not mean ignoring real problems.\n\nIt means describing the situation in a way that leaves room for growth, support, and future change.', 'uploads/wellness_hub/positivity.jpg', 'MindBloom Wellness Team', '4 min', 'published', '2026-07-05 10:00:00', '2026-07-22 22:14:05', '2026-07-22 22:14:05'),
(6, NULL, 'self-compassion', 'Why Self-Compassion Beats Self-Discipline', 'Expert', 'A closer look at the science of being kind to yourself.', 'Self-discipline can be useful, but harsh self-criticism often increases shame and stress.\n\nSelf-compassion means responding to your own difficulty with kindness, honesty, and support.\n\nIt does not mean avoiding responsibility or giving up.\n\nA self-compassionate response might sound like: This is difficult, but I can take one small step and ask for help if I need it.\n\nPeople often become more consistent when they feel supported rather than attacked by their own inner voice.\n\nKindness and accountability can exist together.', 'uploads/wellness_hub/self-compassion.jpg', 'Dr. Daniel Foster', '10 min', 'published', '2026-07-03 10:00:00', '2026-07-22 22:14:05', '2026-07-22 22:14:05'),
(7, NULL, 'box-breathing', 'Box Breathing: The Navy SEAL Calm Trick', 'Anxiety', 'A 4-4-4-4 pattern used by performers under pressure.', 'Box breathing is a simple breathing pattern that can help slow down the stress response.\n\nInhale through your nose for four seconds.\n\nHold your breath gently for four seconds.\n\nExhale slowly for four seconds.\n\nPause for four seconds before beginning again.\n\nRepeat the cycle three or four times without forcing your breath.\n\nStop if you feel dizzy or uncomfortable and return to normal breathing.', 'uploads/wellness_hub/box-breathing.jpg', 'MindBloom Wellness Team', '3 min', 'published', '2026-07-02 10:00:00', '2026-07-22 22:14:05', '2026-07-22 22:14:05'),
(8, NULL, 'better-mornings', 'The Light & Dark of Better Mornings', 'Sleep', 'How your circadian rhythm shapes your mood — and what to do.', 'Your body uses light and darkness to help regulate sleep and wakefulness.\n\nMorning light can help your brain understand that the day has started.\n\nTry opening the curtains or spending a few minutes outside after waking.\n\nAt night, reducing bright light and screen exposure can make it easier for your body to prepare for sleep.\n\nA regular wake-up time can also support a more stable sleep rhythm.\n\nSmall changes made consistently are usually more helpful than a perfect routine followed only occasionally.', 'uploads/wellness_hub/better-mornings.jpg', 'Olivia Hart', '6 min', 'published', '2026-06-30 10:00:00', '2026-07-22 22:14:05', '2026-07-22 22:14:05'),
(10, 21, 'simone-biles-the-courage-to-put-mental-health-first', 'Simone Biles: The Courage to Put Mental Health First', 'Mental Health Awareness', 'Olympic gymnast Simone Biles showed the world that taking care of your mental health is a sign of strength, not weakness. Her decision inspired millions to prioritize wellbeing over pressure and expectations.', 'The Silent Strength of Simone Biles\r\n\r\nIn 2021, during the Tokyo Olympic Games, the world watched one of the greatest gymnasts in history make an unexpected decision. Simone Biles withdrew from several Olympic events to focus on her mental health after experiencing a condition known as the \"twisties,\" which made performing dangerous gymnastics routines unsafe.\r\n\r\nMany people expected her to continue competing despite the pressure. Instead, she chose to protect her health and safety. Her decision sparked conversations around the world about mental health, stress, anxiety, and the importance of knowing when to pause.\r\n\r\nFor years, athletes had been celebrated only for winning medals. Simone Biles reminded everyone that behind every achievement is a human being with emotions, fears, and limits.\r\n\r\nHer courage helped millions realize that asking for help is not weakness—it is strength.\r\n\r\nToday, mental health professionals often refer to her story as an example of healthy self-awareness, emotional intelligence, and responsible decision-making.\r\n\r\nWhether you are a student preparing for exams, an employee facing work pressure, or someone dealing with personal challenges, Simone\'s story teaches us that our wellbeing should always come before expectations.\r\n\r\nMental health deserves the same attention as physical health. Taking breaks, seeking support, practicing mindfulness, and talking openly about emotions are all positive steps toward a healthier life.\r\n\r\nRemember, success means little if it comes at the cost of your mental wellbeing.', 'uploads/wellness_hub/wellness_1785500420_99a8dfd8.jpg', 'MindBloom Wellness Team', '4 min', 'published', '2026-07-31 17:20:20', '2026-07-31 12:20:20', '2026-07-31 12:20:20');

-- --------------------------------------------------------

--
-- Table structure for table `wellness_plans`
--

CREATE TABLE `wellness_plans` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `assessment_id` int(10) UNSIGNED DEFAULT NULL,
  `plan_title` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `assessment_score` decimal(5,2) NOT NULL,
  `wellness_level` varchar(50) NOT NULL,
  `ai_summary` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `progress_percentage` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `recommendation_source` enum('ai','fallback') NOT NULL DEFAULT 'fallback',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wellness_plans`
--

INSERT INTO `wellness_plans` (`id`, `user_id`, `assessment_id`, `plan_title`, `category`, `category_name`, `assessment_score`, `wellness_level`, `ai_summary`, `start_date`, `end_date`, `status`, `progress_percentage`, `recommendation_source`, `created_at`, `updated_at`) VALUES
(1, 24, 6, '7-Day Mood Wellness Plan', 'mood', 'Mood', 91.00, 'Strong Wellness', 'This seven-day plan provides small, practical steps to support your mood wellness.', '2026-07-28', '2026-08-03', 'active', 86, 'fallback', '2026-07-28 12:05:35', '2026-07-28 12:28:12'),
(2, 20, 7, '7-Day Stress Wellness Plan', 'stress', 'Stress', 55.00, 'Moderate Concern', 'Manha, this plan helps you tackle daily demands and feel more in control. It focuses on small, regular steps to manage your time, ease tension, and boost your mood.', '2026-07-28', '2026-08-03', 'active', 14, 'ai', '2026-07-28 13:06:59', '2026-07-29 02:28:09'),
(3, 25, 9, '7-Day Anxiety Wellness Plan', 'anxiety', 'Anxiety', 50.00, 'Moderate Concern', 'Hashir, this plan offers simple steps to help you manage feelings of being on edge and finding relaxation, focusing on gentle awareness and small actions each day.', '2026-07-29', '2026-08-04', 'active', 14, 'ai', '2026-07-29 03:07:40', '2026-07-29 03:07:58');

-- --------------------------------------------------------

--
-- Table structure for table `wellness_plan_tasks`
--

CREATE TABLE `wellness_plan_tasks` (
  `id` int(10) UNSIGNED NOT NULL,
  `plan_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `day_number` tinyint(3) UNSIGNED NOT NULL,
  `task_date` date NOT NULL,
  `task_title` varchar(180) NOT NULL,
  `task_description` text DEFAULT NULL,
  `activity_type` varchar(60) DEFAULT NULL,
  `duration_minutes` tinyint(3) UNSIGNED DEFAULT NULL,
  `status` enum('pending','completed','skipped') NOT NULL DEFAULT 'pending',
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wellness_plan_tasks`
--

INSERT INTO `wellness_plan_tasks` (`id`, `plan_id`, `user_id`, `day_number`, `task_date`, `task_title`, `task_description`, `activity_type`, `duration_minutes`, `status`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 24, 1, '2026-07-28', 'Gentle Mood Check', 'Name your current mood and write one possible reason for it.', 'mood', 5, 'completed', '2026-07-28 17:06:14', '2026-07-28 12:05:35', '2026-07-28 12:06:14'),
(2, 1, 24, 2, '2026-07-29', 'Small Enjoyable Activity', 'Spend ten minutes doing one simple activity you usually enjoy.', 'self_care', 10, 'completed', '2026-07-28 17:06:18', '2026-07-28 12:05:35', '2026-07-28 12:06:18'),
(3, 1, 24, 3, '2026-07-30', 'Gratitude Moment', 'Write three small things that brought comfort or support today.', 'gratitude', 7, 'completed', '2026-07-28 17:09:09', '2026-07-28 12:05:35', '2026-07-28 12:09:09'),
(4, 1, 24, 4, '2026-07-31', 'Fresh-Air Walk', 'Take a short walk and notice the light, sounds and movement around you.', 'walking', 10, 'completed', '2026-07-28 17:19:27', '2026-07-28 12:05:35', '2026-07-28 12:19:27'),
(5, 1, 24, 5, '2026-08-01', 'Supportive Self-Talk', 'Write one kind sentence you would say to a close friend in your situation.', 'reflection', 5, 'completed', '2026-07-28 17:20:20', '2026-07-28 12:05:35', '2026-07-28 12:20:20'),
(6, 1, 24, 6, '2026-08-02', 'Connect With Someone', 'Send a message or speak with someone who helps you feel supported.', 'connection', 10, 'completed', '2026-07-28 17:28:12', '2026-07-28 12:05:35', '2026-07-28 12:28:12'),
(7, 1, 24, 7, '2026-08-03', 'Mood Progress Review', 'Review your week and identify one activity that supported your mood.', 'review', 10, 'pending', NULL, '2026-07-28 12:05:35', '2026-07-28 12:05:35'),
(8, 2, 20, 1, '2026-07-28', 'Set Daily Priorities', 'Spend 10 minutes to list your top 3 most important tasks for tomorrow to help manage your time.', 'reflection', 10, 'pending', NULL, '2026-07-28 13:06:59', '2026-07-28 13:06:59'),
(9, 2, 20, 2, '2026-07-29', 'Quick Mood Check-in', 'Write down how you are feeling and one thing that contributed to your mood today for 10 minutes.', 'journaling', 10, 'completed', '2026-07-29 07:28:09', '2026-07-28 13:06:59', '2026-07-29 02:28:09'),
(10, 2, 20, 3, '2026-07-30', 'Mindful Breathing Break', 'Find a quiet spot, close your eyes, and take 5 deep, slow breaths, focusing on the air moving in and out to release tension.', 'breathing', 5, 'pending', NULL, '2026-07-28 13:06:59', '2026-07-28 13:06:59'),
(11, 2, 20, 4, '2026-07-31', 'Short Movement Break', 'Take a 15-minute walk outside, paying attention to what you see, hear, and feel around you to clear your mind.', 'walking', 15, 'pending', NULL, '2026-07-28 13:06:59', '2026-07-28 13:06:59'),
(12, 2, 20, 5, '2026-08-01', 'Practice Gratitude', 'List three things, big or small, that you are grateful for today and why to shift your perspective.', 'gratitude', 5, 'pending', NULL, '2026-07-28 13:06:59', '2026-07-28 13:06:59'),
(13, 2, 20, 6, '2026-08-02', 'Regain Control', 'Reflect on one area where you felt a lack of control today and one small step you can take tomorrow to regain some control.', 'reflection', 10, 'pending', NULL, '2026-07-28 13:06:59', '2026-07-28 13:06:59'),
(14, 2, 20, 7, '2026-08-03', 'Weekly Wellness Review', 'Look back at your week for 10 minutes. Acknowledge one positive change you noticed and one area you want to continue working on.', 'mindfulness', 10, 'pending', NULL, '2026-07-28 13:06:59', '2026-07-28 13:06:59'),
(15, 3, 25, 1, '2026-07-29', 'Mindful Breath', 'Take 5 deep breaths, slowly inhaling through your nose and exhaling through your mouth, focusing on the sensation of your breath.', 'breathing', 5, 'completed', '2026-07-29 08:07:58', '2026-07-29 03:07:40', '2026-07-29 03:07:58'),
(16, 3, 25, 2, '2026-07-30', 'Release Your Thoughts', 'Write down any worries or uneasy feelings you have, without judgment, for 10 minutes to help clear your mind.', 'journaling', 10, 'pending', NULL, '2026-07-29 03:07:40', '2026-07-29 03:07:40'),
(17, 3, 25, 3, '2026-07-31', '5-4-3-2-1 Grounding', 'Name 5 things you can see, 4 things you can feel, 3 things you can hear, 2 things you can smell, and 1 thing you can taste to bring you to the present moment.', 'mindfulness', 8, 'pending', NULL, '2026-07-29 03:07:40', '2026-07-29 03:07:40'),
(18, 3, 25, 4, '2026-08-01', 'Gentle Mindful Walk', 'Take a short walk outdoors, focusing on the sights, sounds, and sensations around you without judgment.', 'walking', 15, 'pending', NULL, '2026-07-29 03:07:40', '2026-07-29 03:07:40'),
(19, 3, 25, 5, '2026-08-02', 'Daily Gratitude Moment', 'Think of 3 small things you are grateful for today and write them down, noticing how they make you feel.', 'gratitude', 7, 'pending', NULL, '2026-07-29 03:07:40', '2026-07-29 03:07:40'),
(20, 3, 25, 6, '2026-08-03', 'Reflect and Release', 'Reflect on a moment today where you felt relaxed or calm, and write down what helped you achieve that feeling.', 'reflection', 10, 'pending', NULL, '2026-07-29 03:07:40', '2026-07-29 03:07:40'),
(21, 3, 25, 7, '2026-08-04', 'Weekly Check-in', 'Review your week and acknowledge your efforts. Plan one small, relaxing activity for the upcoming week.', 'review', 12, 'pending', NULL, '2026-07-29 03:07:40', '2026-07-29 03:07:40');

-- --------------------------------------------------------

--
-- Table structure for table `wellness_post_bookmarks`
--

CREATE TABLE `wellness_post_bookmarks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wellness_post_bookmarks`
--

INSERT INTO `wellness_post_bookmarks` (`id`, `user_id`, `post_id`, `created_at`) VALUES
(2, 24, 1, '2026-07-23 08:26:31'),
(4, 20, 2, '2026-07-31 12:11:10'),
(5, 20, 10, '2026-08-01 07:31:52');

-- --------------------------------------------------------

--
-- Table structure for table `wellness_post_likes`
--

CREATE TABLE `wellness_post_likes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wellness_post_likes`
--

INSERT INTO `wellness_post_likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES
(2, 24, 1, '2026-07-23 08:26:50'),
(4, 20, 2, '2026-07-31 12:11:09'),
(5, 20, 10, '2026-08-01 07:15:40');

-- --------------------------------------------------------

--
-- Table structure for table `wellness_task_responses`
--

CREATE TABLE `wellness_task_responses` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(10) UNSIGNED NOT NULL,
  `task_id` int(10) UNSIGNED NOT NULL,
  `response_text` text NOT NULL,
  `activity_type` varchar(60) DEFAULT NULL,
  `duration_minutes` tinyint(3) UNSIGNED DEFAULT NULL,
  `completion_confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wellness_task_responses`
--

INSERT INTO `wellness_task_responses` (`id`, `user_id`, `plan_id`, `task_id`, `response_text`, `activity_type`, `duration_minutes`, `completion_confirmed`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 20, 2, 9, 'i talk with my friend and now feeling so calm', 'journaling', 10, 1, '2026-07-29 07:28:09', '2026-07-29 02:28:09', '2026-07-29 02:28:09'),
(2, 25, 3, 15, 'feeling calm', 'breathing', 5, 1, '2026-07-29 08:07:58', '2026-07-29 03:07:58', '2026-07-29 03:07:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `certificate_number` (`certificate_number`),
  ADD UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_key`);

--
-- Indexes for table `assessment_history`
--
ALTER TABLE `assessment_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assessment_user` (`user_id`),
  ADD KEY `idx_assessment_category` (`category`),
  ADD KEY `idx_assessment_created` (`created_at`);

--
-- Indexes for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_contact_user` (`user_id`);

--
-- Indexes for table `daily_challenges`
--
ALTER TABLE `daily_challenges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_challenge_day` (`user_id`,`challenge_date`);

--
-- Indexes for table `gratitude_entries`
--
ALTER TABLE `gratitude_entries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mindfulness_entries`
--
ALTER TABLE `mindfulness_entries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mood_entries`
--
ALTER TABLE `mood_entries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `positive_thoughts`
--
ALTER TABLE `positive_thoughts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reflection_entries`
--
ALTER TABLE `reflection_entries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reminders`
--
ALTER TABLE `reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reminder_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `wellness_hub_posts`
--
ALTER TABLE `wellness_hub_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wellness_slug` (`slug`),
  ADD KEY `fk_wellness_post_admin` (`admin_id`);

--
-- Indexes for table `wellness_plans`
--
ALTER TABLE `wellness_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_plan_user` (`user_id`),
  ADD KEY `idx_plan_assessment` (`assessment_id`),
  ADD KEY `idx_plan_status` (`status`),
  ADD KEY `idx_plan_dates` (`start_date`,`end_date`);

--
-- Indexes for table `wellness_plan_tasks`
--
ALTER TABLE `wellness_plan_tasks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_plan_day` (`plan_id`,`day_number`),
  ADD KEY `idx_plan_task_plan` (`plan_id`),
  ADD KEY `idx_plan_task_user` (`user_id`),
  ADD KEY `idx_plan_task_date` (`task_date`),
  ADD KEY `idx_plan_task_status` (`status`);

--
-- Indexes for table `wellness_post_bookmarks`
--
ALTER TABLE `wellness_post_bookmarks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_post_bookmark` (`user_id`,`post_id`),
  ADD KEY `fk_wellness_bookmark_post` (`post_id`);

--
-- Indexes for table `wellness_post_likes`
--
ALTER TABLE `wellness_post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_post_like` (`user_id`,`post_id`),
  ADD KEY `fk_wellness_like_post` (`post_id`);

--
-- Indexes for table `wellness_task_responses`
--
ALTER TABLE `wellness_task_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_task_response` (`user_id`,`plan_id`,`task_id`),
  ADD KEY `idx_response_user` (`user_id`),
  ADD KEY `idx_response_plan` (`plan_id`),
  ADD KEY `idx_response_task` (`task_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `assessment_history`
--
ALTER TABLE `assessment_history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `daily_challenges`
--
ALTER TABLE `daily_challenges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gratitude_entries`
--
ALTER TABLE `gratitude_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mindfulness_entries`
--
ALTER TABLE `mindfulness_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `mood_entries`
--
ALTER TABLE `mood_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `positive_thoughts`
--
ALTER TABLE `positive_thoughts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reflection_entries`
--
ALTER TABLE `reflection_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reminders`
--
ALTER TABLE `reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `wellness_hub_posts`
--
ALTER TABLE `wellness_hub_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `wellness_plans`
--
ALTER TABLE `wellness_plans`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wellness_plan_tasks`
--
ALTER TABLE `wellness_plan_tasks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `wellness_post_bookmarks`
--
ALTER TABLE `wellness_post_bookmarks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `wellness_post_likes`
--
ALTER TABLE `wellness_post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `wellness_task_responses`
--
ALTER TABLE `wellness_task_responses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `fk_achievement_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_history`
--
ALTER TABLE `assessment_history`
  ADD CONSTRAINT `fk_assessment_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `fk_contact_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reminders`
--
ALTER TABLE `reminders`
  ADD CONSTRAINT `fk_reminder_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wellness_hub_posts`
--
ALTER TABLE `wellness_hub_posts`
  ADD CONSTRAINT `fk_wellness_post_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `wellness_plans`
--
ALTER TABLE `wellness_plans`
  ADD CONSTRAINT `fk_wellness_plan_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessment_history` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wellness_plan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wellness_plan_tasks`
--
ALTER TABLE `wellness_plan_tasks`
  ADD CONSTRAINT `fk_wellness_plan_task_plan` FOREIGN KEY (`plan_id`) REFERENCES `wellness_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wellness_plan_task_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wellness_post_bookmarks`
--
ALTER TABLE `wellness_post_bookmarks`
  ADD CONSTRAINT `fk_wellness_bookmark_post` FOREIGN KEY (`post_id`) REFERENCES `wellness_hub_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wellness_bookmark_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wellness_post_likes`
--
ALTER TABLE `wellness_post_likes`
  ADD CONSTRAINT `fk_wellness_like_post` FOREIGN KEY (`post_id`) REFERENCES `wellness_hub_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wellness_like_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wellness_task_responses`
--
ALTER TABLE `wellness_task_responses`
  ADD CONSTRAINT `fk_task_response_plan` FOREIGN KEY (`plan_id`) REFERENCES `wellness_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_task_response_task` FOREIGN KEY (`task_id`) REFERENCES `wellness_plan_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_task_response_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
