import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

type Language = 'FR' | 'AR' | 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [language, setLanguageState] = useState<Language>('FR');

  useEffect(() => {
    const loadLanguage = async () => {
      // Priority 1: User profile language (if logged in)
      if (user?.language) {
        setLanguageState(user.language.toUpperCase() as Language);
        return;
      }

      // Priority 2: Stored language in AsyncStorage
      try {
        const storedLang = await AsyncStorage.getItem('app_language');
        if (storedLang) {
          setLanguageState(storedLang as Language);
        }
      } catch (error) {
        console.warn('Error loading language from storage:', error);
      }
    };

    loadLanguage();
  }, [user?.language]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    
    // Save to AsyncStorage for both logged in and guest users
    try {
      await AsyncStorage.getItem('app_language');
      await AsyncStorage.setItem('app_language', lang);
    } catch (error) {
      console.warn('Error saving language to storage:', error);
    }

    // Update user profile if logged in
    if (user) {
      await updateProfile({
        language: lang.toLowerCase() as any,
      });
    }
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['FR']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations = {
  FR: {
    // Splash
    splash_title: 'CANSTORY',
    splash_subtitle: 'La plateforme solidaire contre le cancer en Algérie',
    splash_feature1: '• Information fiable & actualités médicales',
    splash_feature2: '• Annuaire des professionnels par wilaya',
    splash_feature3: '• Conseils nutrition & guides pratiques',
    splash_algeria: '🇩🇿 Pensée pour les patients en Algérie',
    splash_footer: 'Gratuit • Sécurisé • Multilingue',
    splash_button: 'Commencer',
    skip: 'Passer',
    // Login
    welcome: 'Bienvenue',
    login_subtitle: 'Connectez-vous à votre compte canstory',
    email: 'Email',
    password: 'Mot de passe',
    forgot_password: 'Mot de passe oublié?',
    login_button: 'Se connecter',
    no_account: 'Pas encore de compte?',
    signup_link: 'S\'inscrire',
    // Greetings
    greeting_morning: 'Bonjour',
    greeting_afternoon: 'Bon après-midi',
    greeting_evening: 'Bonsoir',
    // Header
    choose_lang: 'Choisir la langue',
    // Profile
    profile_title: 'Profil',
    account_info: 'Informations du compte',
    actions: 'Actions',
    edit_profile: 'Modifier le profil',
    notif_settings: 'Paramètres de notification',
    lang_settings: 'Langue',
    privacy: 'Confidentialité',
    help_support: 'Aide & Support',
    about_app: 'À propos de Canstory',
    sign_out: 'Se déconnecter',
    delete_account: 'Supprimer mon compte',
    sign_out_confirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    success: 'Succès',
    error: 'Erreur',
    avatar_updated: 'Photo de profil mise à jour',
    // Edit Profile
    edit_profile_title: 'Modifier le profil',
    full_name_label: 'Nom complet',
    wilaya_label: 'Wilaya',
    commune_label: 'Commune',
    phone_label: 'Téléphone',
    save: 'Enregistrer',
    required_fields: '* Champs obligatoires',
    error_name_required: 'Le nom complet est requis',
    error_wilaya_required: 'La wilaya est requise',
    error_commune_required: 'La commune est requise',
    profile_updated: 'Profil mis à jour avec succès',
    back: 'Retour',
    // Notifications
    notifications_title: 'Notifications',
    mark_all_read: 'Tout marquer lu',
    no_notifications: 'Aucune notification',
    // Directory
    directory_title: 'Annuaire',
    directory_subtitle: 'Trouvez des professionnels de santé',
    search_placeholder: 'Rechercher...',
    all_wilayas: 'Toutes les wilayas',
    category_all: 'Tous',
    category_doctors: 'Médecins',
    category_centers: 'Centres',
    category_psy: 'Psy',
    category_labs: 'Labs',
    category_pharmacies: 'Pharmacies',
    category_assoc: 'Assoc',
    category_lodging: 'Logements',
    call: 'Appeler',
    itinerary: 'Itinéraire',
    details_contact: 'Coordonnées',
    details_hours: 'Horaires d\'ouverture',
    details_about: 'À propos',
    call_now: 'Appeler maintenant',
    view_on_map: 'Voir sur la carte',
    no_results: 'Aucun résultat trouvé',
    // Signup
    signup_title: 'Rejoignez Canstory',
    signup_subtitle: 'Créez votre compte',
    role_label: 'Rôle',
    role_patient: 'Patient / Proche',
    role_doctor: 'Médecin',
    role_pharmacy: 'Pharmacie',
    role_association: 'Association',
    role_cancer_center: 'Centre Cancer',
    role_laboratory: 'Laboratoire',
    select_role: 'Sélectionnez votre rôle',
    select_wilaya: 'Sélectionnez votre wilaya',
    select_commune: 'Sélectionnez votre commune',
    confirm_password: 'Confirmer le mot de passe',
    signup_button: 'Créer mon compte',
    already_account: 'Vous avez déjà un compte?',
    full_name_placeholder: 'Votre nom',
    email_placeholder: 'votre@email.com',
    password_placeholder: '••••••••',
    confirm_password_placeholder: '••••••••',
    ok: 'OK',
    error_fill_all_fields: 'Veuillez remplir tous les champs',
    error_passwords_not_match: 'Les mots de passe ne correspondent pas',
    error_password_length: 'Le mot de passe doit contenir au moins 6 caractères',
    signup_error_title: 'Erreur d\'inscription',
    signup_success_doctor_message: 'Compte créé avec succès! Veuillez vous connecter pour compléter votre profil.',
    signup_success_message: 'Compte créé avec succès! Veuillez vous connecter.',
    access_denied: 'Accès refusé',
    profile_not_active: 'Votre profil n\'est pas encore activé. Veuillez attendre l\'approbation de l\'administrateur.',
    error_login: 'Erreur de connexion',
    user_not_found: 'Données utilisateur introuvables',
    error_occurred: 'Une erreur est survenue lors de la connexion',
    // Language Selection
    lang_title: 'Langue',
    choose_lang_desc: 'Choisissez votre langue d\'affichage de l\'application',
    // Home
    home_featured_badge: 'À LA UNE',
    home_featured_title: 'Votre allié santé au quotidien',
    home_featured_desc: 'Découvrez nos conseils personnalisés et trouvez les meilleurs spécialistes près de chez vous.',
    home_latest_articles: 'Derniers articles',
    home_resources: 'Ressources',
    home_listening_line: 'Ligne d\'écoute',
    home_listening_line_desc: 'Support psychologique',
    home_pharmacies: 'Pharmacies',
    home_pharmacies_desc: 'Pharmacies de garde',
    home_no_articles: 'Aucun article',
    // I3lam
    i3lam_title: 'I3lam',
    i3lam_subtitle: 'Actualités et informations de santé',
    cat_news: 'Actualités',
    cat_health: 'Santé',
    cat_events: 'Événements',
    cat_research: 'Recherche',
    featured: 'À la une',
    recent_articles: 'Articles récents',
    // Ghida2ak
    ghida2ak_title: 'Ghida2ak',
    ghida2ak_subtitle: 'Votre guide nutritionnel',
    cat_recipes: 'Recettes',
    cat_tips: 'Conseils',
    cat_vitamins: 'Vitamines',
    cat_diets: 'Régimes',
    tip_of_day: 'Conseil du jour',
    recommended_recipes: 'Recettes recommandées',
    difficulty_easy: 'Niveau: Facile',
    difficulty_medium: 'Niveau: Moyen',
    difficulty_hard: 'Niveau: Difficile',
    // Nassa2ih
    nassa2ih_title: 'Nassa2ih',
    nassa2ih_subtitle: 'Conseils et bien-être au quotidien',
    cat_wellbeing: 'Bien-être',
    cat_psychology: 'Psychologie',
    cat_sport: 'Sport',
    cat_sleep: 'Sommeil',
    read_full_tip: 'Lire le conseil complet',
    all_tips: 'Tous les conseils',
    // About
    about_loading: 'Chargement...',
    about_team: 'Notre Équipe',
    about_contact: 'Nous Contacter',
    about_no_info: 'Aucune information disponible',
    about_soon: 'Le contenu sera bientôt disponible',
    about_hero_subtitle: 'Canstory - Ensemble contre le cancer',
    view_more: 'Voir plus',
    view_less: 'Voir moins',
    tap_to_expand: 'Appuyez pour voir la bio',
    tap_to_collapse: 'Appuyez pour réduire',
    // Notification Settings
    manage_notif_title: 'Gérer les notifications',
    manage_notif_desc: 'Choisissez les types de notifications que vous souhaitez recevoir',
    notif_articles_desc: 'Nouveaux articles et actualités',
    notif_appointments: 'Rendez-vous',
    notif_appointments_desc: 'Rappels de rendez-vous médicaux',
    notif_messages: 'Messages',
    notif_messages_desc: 'Nouveaux messages privés',
    notif_community_desc: 'Réponses et mentions dans la communauté',
    notif_system: 'Système',
    notif_system_desc: 'Mises à jour et annonces importantes',
    settings_saved: 'Paramètres mis à jour avec succès',
    error_save_settings: 'Impossible de sauvegarder les paramètres',
    // Community
    community_title: 'Communauté',
    anonymous: 'Anonyme',
  },
  AR: {
    // Splash
    splash_title: 'CANSTORY',
    splash_subtitle: 'المنصة التضامنية ضد السرطان في الجزائر',
    splash_feature1: '• معلومات موثوقة وأخبار طبية',
    splash_feature2: '• دليل المهنيين حسب الولاية',
    splash_feature3: '• نصائح غذائية وأدلة عملية',
    splash_algeria: '🇩🇿 صممت للمرضى في الجزائر',
    splash_footer: 'مجاني • آمن • متعدد اللغات',
    splash_button: 'البدء',
    skip: 'تخطي',
    // Login
    welcome: 'مرحباً',
    login_subtitle: 'قم بتسجيل الدخول إلى حسابك في canstory',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgot_password: 'هل نسيت كلمة المرور؟',
    login_button: 'تسجيل الدخول',
    no_account: 'ليس لديك حساب بعد؟',
    signup_link: 'إنشاء حساب',
    // Greetings
    greeting_morning: 'صباح الخير',
    greeting_afternoon: 'طاب مساؤك',
    greeting_evening: 'مساء الخير',
    // Header
    choose_lang: 'اختر اللغة',
    // Profile
    profile_title: 'الملف الشخصي',
    account_info: 'معلومات الحساب',
    actions: 'الإجراءات',
    edit_profile: 'تعديل الملف الشخصي',
    notif_settings: 'إعدادات الإشعارات',
    lang_settings: 'اللغة',
    privacy: 'الخصوصية',
    help_support: 'المساعدة والدعم',
    about_app: 'حول كانستوري',
    sign_out: 'تسجيل الخروج',
    delete_account: 'حذف حسابي',
    sign_out_confirm: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    success: 'نجاح',
    error: 'خطأ',
    avatar_updated: 'تم تحديث صورة الملف الشخصي',
    // Edit Profile
    edit_profile_title: 'تعديل الملف الشخصي',
    full_name_label: 'الاسم الكامل',
    wilaya_label: 'الولاية',
    commune_label: 'البلدية',
    phone_label: 'رقم الهاتف',
    save: 'حفظ',
    required_fields: '* الحقول المطلوبة',
    error_name_required: 'الاسم الكامل مطلوب',
    error_wilaya_required: 'الولاية مطلوبة',
    error_commune_required: 'البلدية مطلوبة',
    profile_updated: 'تم تحديث الملف الشخصي بنجاح',
    back: 'عودة',
    // Notifications
    notifications_title: 'الإشعارات',
    mark_all_read: 'تمييز الكل كمقروء',
    no_notifications: 'لا توجد إشعارات',
    // Directory
    directory_title: 'الدليل',
    directory_subtitle: 'ابحث عن المتخصصين الصحيين',
    search_placeholder: 'بحث...',
    all_wilayas: 'كل الولايات',
    category_all: 'الكل',
    category_doctors: 'أطباء',
    category_centers: 'مراكز',
    category_psy: 'نفسيين',
    category_labs: 'مختبرات',
    category_pharmacies: 'صيدليات',
    category_assoc: 'جمعيات',
    category_lodging: 'مبيت',
    call: 'اتصال',
    itinerary: 'المسار',
    details_contact: 'معلومات الاتصال',
    details_hours: 'ساعات العمل',
    details_about: 'حول',
    call_now: 'اتصل الآن',
    view_on_map: 'عرض على الخريطة',
    no_results: 'لم يتم العثور على نتائج',
    // Signup
    signup_title: 'انضم إلى كانستوري',
    signup_subtitle: 'أنشئ حسابك',
    role_label: 'الدور',
    role_patient: 'مريض / مرافق',
    role_doctor: 'طبيب',
    role_pharmacy: 'صيدلية',
    role_association: 'جمعية',
    role_cancer_center: 'مركز سرطان',
    role_laboratory: 'مختبر',
    select_role: 'اختر دورك',
    select_wilaya: 'اختر ولايتك',
    select_commune: 'اختر بلديتك',
    confirm_password: 'تأكيد كلمة المرور',
    signup_button: 'إنشاء حسابي',
    already_account: 'لديك حساب بالفعل؟',
    full_name_placeholder: 'اسمك',
    email_placeholder: 'بريدك@الإلكتروني.com',
    password_placeholder: '••••••••',
    confirm_password_placeholder: '••••••••',
    ok: 'موافق',
    error_fill_all_fields: 'يرجى ملء جميع الحقول',
    error_passwords_not_match: 'كلمات المرور غير متوافقة',
    error_password_length: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
    signup_error_title: 'خطأ في التسجيل',
    signup_success_doctor_message: 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول لإكمال ملفك الشخصي.',
    signup_success_message: 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.',
    access_denied: 'تم رفض الوصول',
    profile_not_active: 'لم يتم تفعيل حسابك بعد. يرجى انتظار موافقة المسؤول.',
    error_login: 'خطأ في تسجيل الدخول',
    user_not_found: 'لم يتم العثور على بيانات المستخدم',
    error_occurred: 'حدث خطأ أثناء الاتصال',
    // Language Selection
    lang_title: 'اللغة',
    choose_lang_desc: 'اختر لغة عرض التطبيق',
    // Home
    home_featured_badge: 'الأهم',
    home_featured_title: 'حليفك الصحي اليومي',
    home_featured_desc: 'اكتشف نصائحنا الشخصية وابحث عن أفضل المتخصصين بالقرب منك.',
    home_latest_articles: 'أحدث المقالات',
    home_resources: 'الموارد',
    home_listening_line: 'خط الاستماع',
    home_listening_line_desc: 'الدعم النفسي',
    home_pharmacies: 'الصيدليات',
    home_pharmacies_desc: 'صيدليات المناوبة',
    home_no_articles: 'لا توجد مقالات',
    // I3lam
    i3lam_title: 'إعلام',
    i3lam_subtitle: 'أخبار ومعلومات صحية',
    cat_news: 'أخبار',
    cat_health: 'صحة',
    cat_events: 'فعاليات',
    cat_research: 'أبحاث',
    featured: 'الأهم',
    recent_articles: 'أحدث المقالات',
    // Ghida2ak
    ghida2ak_title: 'غذاؤك',
    ghida2ak_subtitle: 'دليلك الغذائي',
    cat_recipes: 'وصفات',
    cat_tips: 'نصائح',
    cat_vitamins: 'فيتامينات',
    cat_diets: 'حميات',
    tip_of_day: 'نصيحة اليوم',
    recommended_recipes: 'وصفات مقترحة',
    difficulty_easy: 'المستوى: سهل',
    difficulty_medium: 'المستوى: متوسط',
    difficulty_hard: 'المستوى: صعب',
    // Nassa2ih
    nassa2ih_title: 'نصائح',
    nassa2ih_subtitle: 'نصائح ورفاهية يومية',
    cat_wellbeing: 'رفاهية',
    cat_psychology: 'علم نفس',
    cat_sport: 'رياضة',
    cat_sleep: 'نوم',
    read_full_tip: 'اقرأ النصيحة كاملة',
    all_tips: 'جميع النصائح',
    // About
    about_loading: 'جاري التحميل...',
    about_team: 'فريقنا',
    about_contact: 'اتصل بنا',
    about_no_info: 'لا توجد معلومات متاحة',
    about_soon: 'سيكون المحتوى متاحاً قريباً',
    about_hero_subtitle: 'كانستوري - معاً ضد السرطان',
    view_more: 'عرض المزيد',
    view_less: 'عرض أقل',
    tap_to_expand: 'انقر لعرض السيرة الذاتية',
    tap_to_collapse: 'انقر للإغلاق',
    // Notification Settings
    manage_notif_title: 'إدارة الإشعارات',
    manage_notif_desc: 'اختر أنواع الإشعارات التي ترغب في تلقيها',
    notif_articles_desc: 'مقالات وأخبار جديدة',
    notif_appointments: 'المواعيد',
    notif_appointments_desc: 'تذكير بالمواعيد الطبية',
    notif_messages: 'الرسائل',
    notif_messages_desc: 'رسائل خاصة جديدة',
    notif_community_desc: 'الردود والإشارات في المجتمع',
    notif_system: 'النظام',
    notif_system_desc: 'تحديثات وإعلانات هامة',
    settings_saved: 'تم تحديث الإعدادات بنجاح',
    error_save_settings: 'تعذر حفظ الإعدادات',
    // Community
    community_title: 'المجتمع',
    anonymous: 'مجهول',
  },
  EN: {
    // Splash
    splash_title: 'CANSTORY',
    splash_subtitle: 'The solidarity platform against cancer in Algeria',
    splash_feature1: '• Reliable information & medical news',
    splash_feature2: '• Directory of professionals by wilaya',
    splash_feature3: '• Nutrition advice & practical guides',
    splash_algeria: '🇩🇿 Designed for patients in Algeria',
    splash_footer: 'Free • Secure • Multilingual',
    splash_button: 'Get Started',
    skip: 'Skip',
    // Login
    welcome: 'Welcome',
    login_subtitle: 'Log in to your canstory account',
    email: 'Email',
    password: 'Password',
    forgot_password: 'Forgot password?',
    login_button: 'Log In',
    no_account: 'Don\'t have an account yet?',
    signup_link: 'Sign Up',
    // Greetings
    greeting_morning: 'Good Morning',
    greeting_afternoon: 'Good Afternoon',
    greeting_evening: 'Good Evening',
    // Header
    choose_lang: 'Choose Language',
    // Profile
    profile_title: 'Profile',
    account_info: 'Account Information',
    actions: 'Actions',
    edit_profile: 'Edit Profile',
    notif_settings: 'Notification Settings',
    lang_settings: 'Language',
    privacy: 'Privacy',
    help_support: 'Help & Support',
    about_app: 'About Canstory',
    sign_out: 'Sign Out',
    delete_account: 'Delete Account',
    sign_out_confirm: 'Are you sure you want to sign out?',
    confirm: 'Confirm',
    cancel: 'Cancel',
    success: 'Success',
    error: 'Error',
    avatar_updated: 'Profile picture updated',
    // Edit Profile
    edit_profile_title: 'Edit Profile',
    full_name_label: 'Full Name',
    wilaya_label: 'Wilaya',
    commune_label: 'Province',
    phone_label: 'Phone number',
    save: 'Save Changes',
    required_fields: '* Required fields',
    error_name_required: 'Full name is required',
    error_wilaya_required: 'Wilaya is required',
    error_commune_required: 'Province is required',
    profile_updated: 'Profile updated successfully',
    back: 'Back',
    // Notifications
    notifications_title: 'Notifications',
    mark_all_read: 'Mark all as read',
    no_notifications: 'No notifications',
    // Directory
    directory_title: 'Directory',
    directory_subtitle: 'Find healthcare professionals',
    search_placeholder: 'Search...',
    all_wilayas: 'All wilayas',
    category_all: 'All',
    category_doctors: 'Doctors',
    category_centers: 'Centers',
    category_psy: 'Psy',
    category_labs: 'Labs',
    category_pharmacies: 'Pharmacies',
    category_assoc: 'Assoc',
    category_lodging: 'Lodging',
    call: 'Call',
    itinerary: 'Itinerary',
    details_contact: 'Contact Info',
    details_hours: 'Opening Hours',
    details_about: 'About',
    call_now: 'Call Now',
    view_on_map: 'View on Map',
    no_results: 'No results found',
    // Signup
    signup_title: 'Join Canstory',
    signup_subtitle: 'Create your account',
    role_label: 'Role',
    role_patient: 'Patient / Relatives',
    role_doctor: 'Doctor',
    role_pharmacy: 'Pharmacy',
    role_association: 'Association',
    role_cancer_center: 'Cancer Center',
    role_laboratory: 'Laboratory',
    select_role: 'Select your role',
    select_wilaya: 'Select your wilaya',
    select_commune: 'Select your commune',
    confirm_password: 'Confirm password',
    signup_button: 'Create my account',
    already_account: 'Already have an account?',
    full_name_placeholder: 'Your name',
    email_placeholder: 'your@email.com',
    password_placeholder: '••••••••',
    confirm_password_placeholder: '••••••••',
    ok: 'OK',
    error_fill_all_fields: 'Please fill all fields',
    error_passwords_not_match: 'Passwords do not match',
    error_password_length: 'Password must be at least 6 characters',
    signup_error_title: 'Signup Error',
    signup_success_doctor_message: 'Account created successfully! Please log in to complete your profile.',
    signup_success_message: 'Account created successfully! Please log in.',
    access_denied: 'Access Denied',
    profile_not_active: 'Your profile is not active yet. Please wait for administrator approval.',
    error_login: 'Login Error',
    user_not_found: 'User data not found',
    error_occurred: 'An error occurred during sign in',
    // Language Selection
    lang_title: 'Language',
    choose_lang_desc: 'Select the display language for the application',
    // Home
    home_featured_badge: 'FEATURED',
    home_featured_title: 'Your daily health ally',
    home_featured_desc: 'Discover our personalized advice and find the best specialists near you.',
    home_latest_articles: 'Latest Articles',
    home_resources: 'Resources',
    home_listening_line: 'Listening line',
    home_listening_line_desc: 'Psychological support',
    home_pharmacies: 'Pharmacies',
    home_pharmacies_desc: 'On-call pharmacies',
    home_no_articles: 'No articles',
    // I3lam
    i3lam_title: 'I3lam',
    i3lam_subtitle: 'Health news and information',
    cat_news: 'News',
    cat_health: 'Health',
    cat_events: 'Events',
    cat_research: 'Research',
    featured: 'Featured',
    recent_articles: 'Recent Articles',
    // Ghida2ak
    ghida2ak_title: 'Ghida2ak',
    ghida2ak_subtitle: 'Your nutritional guide',
    cat_recipes: 'Recipes',
    cat_tips: 'Tips',
    cat_vitamins: 'Vitamins',
    cat_diets: 'Diets',
    tip_of_day: 'Tip of the Day',
    recommended_recipes: 'Recommended Recipes',
    difficulty_easy: 'Level: Easy',
    difficulty_medium: 'Level: Medium',
    difficulty_hard: 'Level: Hard',
    // Nassa2ih
    nassa2ih_title: 'Nassa2ih',
    nassa2ih_subtitle: 'Daily advice and wellbeing',
    cat_wellbeing: 'Wellbeing',
    cat_psychology: 'Psychology',
    cat_sport: 'Sport',
    cat_sleep: 'Sleep',
    read_full_tip: 'Read full tip',
    all_tips: 'All tips',
    // About
    about_loading: 'Loading...',
    about_team: 'Our Team',
    about_contact: 'Contact Us',
    about_no_info: 'No information available',
    about_soon: 'Content will be available soon',
    about_hero_subtitle: 'Canstory - Together against cancer',
    view_more: 'View more',
    view_less: 'View less',
    tap_to_expand: 'Tap to see bio',
    tap_to_collapse: 'Tap to collapse',
    // Notification Settings
    manage_notif_title: 'Manage Notifications',
    manage_notif_desc: 'Choose the types of notifications you want to receive',
    notif_articles_desc: 'New articles and health news',
    notif_appointments: 'Appointments',
    notif_appointments_desc: 'Medical appointment reminders',
    notif_messages: 'Messages',
    notif_messages_desc: 'New private messages',
    notif_community_desc: 'Replies and mentions in community',
    notif_system: 'System',
    notif_system_desc: 'Important updates and announcements',
    settings_saved: 'Settings updated successfully',
    error_save_settings: 'Could not save settings',
    // Community
    community_title: 'Community',
    anonymous: 'Anonymous',
  },
};
