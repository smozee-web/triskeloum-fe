// src/pages/admin/LandingPageSettings.tsx
import React, { useState, useEffect } from 'react';
import { Save, Globe, Home, Briefcase, BookOpen, DollarSign, Users, Mail, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RichTextEditor from '../../components/RichTextEditor';
import {
    useGetLandingPageContentQuery,
    useGetLandingServicesQuery,
    useGetPricingPlansQuery,
    useUpdateLandingPageContentMutation,
    useCreateLandingServiceMutation,
    useUpdateLandingServiceMutation,
    useDeleteLandingServiceMutation,
    useCreatePricingPlanMutation,
    useUpdatePricingPlanMutation,
    useDeletePricingPlanMutation,
} from '../../services/api';

type TabType = 'home' | 'services' | 'formations' | 'pricing' | 'about' | 'contact' | 'social';

const LandingPageSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch data from API
    const { data: contentData } = useGetLandingPageContentQuery();
    const { data: servicesData } = useGetLandingServicesQuery();
    const { data: pricingData } = useGetPricingPlansQuery();

    // Mutations
    const [updateContent] = useUpdateLandingPageContentMutation();
    const [createService] = useCreateLandingServiceMutation();
    const [updateService] = useUpdateLandingServiceMutation();
    const [deleteService] = useDeleteLandingServiceMutation();
    const [createPlan] = useCreatePricingPlanMutation();
    const [updatePlan] = useUpdatePricingPlanMutation();
    const [deletePlan] = useDeletePricingPlanMutation();

    // Home Section State
    const [homeSettings, setHomeSettings] = useState({
        title_fr: '',
        title_en: '',
        subtitle_fr: '',
        subtitle_en: '',
        description_fr: '',
        description_en: '',
        heroImage: null as File | null,
        ctaText_fr: '',
        ctaText_en: '',
        ctaLink: '',
        ctaSecondaryText_fr: '',
        ctaSecondaryText_en: '',
        ctaSecondaryLink: '',
    });

    // Services Section State
    const [services, setServices] = useState<any[]>([]);

    // Formations Section State
    const [formationSettings, setFormationSettings] = useState({
        title_fr: '',
        title_en: '',
        subtitle_fr: '',
        subtitle_en: '',
        description_fr: '',
        description_en: '',
        topics: [] as any[],
        packs: [] as any[],
    });

    // Pricing Plans State
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);

    // About Section State
    const [aboutSettings, setAboutSettings] = useState({
        title_fr: '',
        title_en: '',
        subtitle_fr: '',
        subtitle_en: '',
        description_fr: '',
        description_en: '',
        content_fr: '',
        content_en: '',
        masterName: '',
        masterTitle_fr: '',
        masterTitle_en: '',
        quote_fr: '',
        quote_en: '',
        initiations: [] as any[],
        expertise_fr: [] as string[],
        expertise_en: [] as string[],
        team: [] as any[],
    });

    // Contact Section State
    const [contactSettings, setContactSettings] = useState({
        title_fr: '',
        title_en: '',
        subtitle_fr: '',
        subtitle_en: '',
        description_fr: '',
        description_en: '',
        whatsapp: '',
        email: '',
        location_fr: '',
        location_en: '',
    });

    // Social Media State
    const [socialMedia, setSocialMedia] = useState({
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        github: '',
    });

    // Load data from API when available
    useEffect(() => {
        if (contentData?.payload) {
            const sections = contentData.payload;

            // Load home section
            const homeSection = sections.find((s: any) => s.section === 'home');
            if (homeSection) {
                setHomeSettings({
                    title_fr: homeSection.titleFr || '',
                    title_en: homeSection.titleEn || '',
                    subtitle_fr: homeSection.subtitleFr || '',
                    subtitle_en: homeSection.subtitleEn || '',
                    description_fr: homeSection.descriptionFr || '',
                    description_en: homeSection.descriptionEn || '',
                    heroImage: null,
                    ctaText_fr: homeSection.ctaTextFr || '',
                    ctaText_en: homeSection.ctaTextEn || '',
                    ctaLink: homeSection.ctaLink || '',
                    ctaSecondaryText_fr: homeSection.metadata?.cta_secondary_text_fr || '',
                    ctaSecondaryText_en: homeSection.metadata?.cta_secondary_text_en || '',
                    ctaSecondaryLink: homeSection.metadata?.cta_secondary_link || '',
                });
            }

            // Load about section
            const aboutSection = sections.find((s: any) => s.section === 'about');
            if (aboutSection) {
                setAboutSettings({
                    title_fr: aboutSection.titleFr ?? aboutSection.title_fr ?? '',
                    title_en: aboutSection.titleEn ?? aboutSection.title_en ?? '',
                    subtitle_fr: aboutSection.subtitleFr ?? aboutSection.subtitle_fr ?? '',
                    subtitle_en: aboutSection.subtitleEn ?? aboutSection.subtitle_en ?? '',
                    description_fr: aboutSection.descriptionFr ?? aboutSection.description_fr ?? '',
                    description_en: aboutSection.descriptionEn ?? aboutSection.description_en ?? '',
                    content_fr: aboutSection.contentFr ?? aboutSection.content_fr ?? '',
                    content_en: aboutSection.contentEn ?? aboutSection.content_en ?? '',
                    masterName: aboutSection.metadata?.master_name ?? aboutSection.metadata?.masterName ?? '',
                    masterTitle_fr: aboutSection.metadata?.master_title_fr ?? aboutSection.metadata?.masterTitleFr ?? '',
                    masterTitle_en: aboutSection.metadata?.master_title_en ?? aboutSection.metadata?.masterTitleEn ?? '',
                    quote_fr: aboutSection.metadata?.quote_fr ?? aboutSection.metadata?.quoteFr ?? '',
                    quote_en: aboutSection.metadata?.quote_en ?? aboutSection.metadata?.quoteEn ?? '',
                    initiations: aboutSection.metadata?.initiations || [],
                    expertise_fr: aboutSection.metadata?.expertise_fr ?? aboutSection.metadata?.expertiseFr ?? [],
                    expertise_en: aboutSection.metadata?.expertise_en ?? aboutSection.metadata?.expertiseEn ?? [],
                    team: aboutSection.metadata?.team || [],
                });
            }

            // Load contact section
            const contactSection = sections.find((s: any) => s.section === 'contact');
            if (contactSection) {
                setContactSettings({
                    title_fr: contactSection.titleFr || contactSection.title_fr || '',
                    title_en: contactSection.titleEn || contactSection.title_en || '',
                    subtitle_fr: contactSection.subtitleFr || contactSection.subtitle_fr || '',
                    subtitle_en: contactSection.subtitleEn || contactSection.subtitle_en || '',
                    description_fr: contactSection.descriptionFr || contactSection.description_fr || '',
                    description_en: contactSection.descriptionEn || contactSection.description_en || '',
                    whatsapp: contactSection.metadata?.whatsapp || '',
                    email: contactSection.metadata?.email || '',
                    location_fr: contactSection.metadata?.location_fr ?? contactSection.metadata?.locationFr ?? '',
                    location_en: contactSection.metadata?.location_en ?? contactSection.metadata?.locationEn ?? '',
                });
            }

            const socialSection = sections.find((s: any) => s.section === 'social');
            if (socialSection) {
                const meta = socialSection.metadata || {};
                setSocialMedia({
                    facebook: meta.facebook || '',
                    twitter: meta.twitter || '',
                    instagram: meta.instagram || '',
                    linkedin: meta.linkedin || '',
                    youtube: meta.youtube || '',
                    github: meta.github || '',
                });
            }

            const formationsSection = sections.find((s: any) => s.section === 'formations');
            if (formationsSection) {
                const topics = (formationsSection.metadata?.topics || []).map((t: any) => ({
                    icon: t.icon || '',
                    label_fr: t.label_fr ?? t.labelFr ?? '',
                    label_en: t.label_en ?? t.labelEn ?? '',
                }));

                const packs = (formationsSection.metadata?.packs || []).map((p: any, idx: number) => ({
                    id: p.id || `pack-${idx}`,
                    title_fr: p.title_fr ?? p.titleFr ?? '',
                    title_en: p.title_en ?? p.titleEn ?? '',
                    subtitle_fr: p.subtitle_fr ?? p.subtitleFr ?? '',
                    subtitle_en: p.subtitle_en ?? p.subtitleEn ?? '',
                    price_eur: p.price_eur ?? p.priceEur ?? 0,
                    price_xof: p.price_xof ?? p.priceXof ?? 0,
                    period_fr: p.period_fr ?? p.periodFr ?? '/mois',
                    period_en: p.period_en ?? p.periodEn ?? '/month',
                    duration_fr: p.duration_fr ?? p.durationFr ?? '',
                    duration_en: p.duration_en ?? p.durationEn ?? '',
                    features_fr: p.features_fr ?? p.featuresFr ?? [],
                    features_en: p.features_en ?? p.featuresEn ?? [],
                    is_premium: p.is_premium ?? p.isPremium ?? false,
                }));

                setFormationSettings({
                    title_fr: formationsSection.titleFr || '',
                    title_en: formationsSection.titleEn || '',
                    subtitle_fr: formationsSection.subtitleFr || '',
                    subtitle_en: formationsSection.subtitleEn || '',
                    description_fr: formationsSection.descriptionFr || '',
                    description_en: formationsSection.descriptionEn || '',
                    topics,
                    packs,
                });
            }
        }
    }, [contentData]);

    useEffect(() => {
        if (servicesData?.payload) {
            setServices(servicesData.payload.map((s: any) => ({
                id: s.id,
                title_fr: s.titleFr,
                title_en: s.titleEn,
                description_fr: s.descriptionFr,
                description_en: s.descriptionEn,
                icon: s.icon,
                price_eur: s.priceEur,
                price_usd: s.priceUsd,
                price_xof: s.priceXof,
                sort_order: s.sortOrder,
                is_active: s.isActive,
            })));
        }
    }, [servicesData]);

    useEffect(() => {
        if (pricingData?.payload) {
            setPricingPlans(pricingData.payload.map((p: any) => ({
                id: p.id,
                name_fr: p.nameFr,
                name_en: p.nameEn,
                description_fr: p.descriptionFr,
                description_en: p.descriptionEn,
                price_eur: p.priceEur,
                price_usd: p.priceUsd,
                price_xof: p.priceXof,
                features_fr: p.featuresFr || [],
                features_en: p.featuresEn || [],
                recommended: p.isRecommended,
            })));
        }
    }, [pricingData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === 'home') {
                await updateContent({
                    section: 'home',
                    data: {
                        title_fr: homeSettings.title_fr,
                        title_en: homeSettings.title_en,
                        subtitle_fr: homeSettings.subtitle_fr,
                        subtitle_en: homeSettings.subtitle_en,
                        description_fr: homeSettings.description_fr,
                        description_en: homeSettings.description_en,
                        cta_text_fr: homeSettings.ctaText_fr,
                        cta_text_en: homeSettings.ctaText_en,
                        cta_link: homeSettings.ctaLink,
                        metadata: {
                            cta_secondary_text_fr: homeSettings.ctaSecondaryText_fr,
                            cta_secondary_text_en: homeSettings.ctaSecondaryText_en,
                            cta_secondary_link: homeSettings.ctaSecondaryLink,
                        }
                    }
                }).unwrap();
            } else if (activeTab === 'about') {
                await updateContent({
                    section: 'about',
                    data: {
                        title_fr: aboutSettings.title_fr,
                        title_en: aboutSettings.title_en,
                        subtitle_fr: aboutSettings.subtitle_fr,
                        subtitle_en: aboutSettings.subtitle_en,
                        description_fr: aboutSettings.description_fr,
                        description_en: aboutSettings.description_en,
                        content_fr: aboutSettings.content_fr,
                        content_en: aboutSettings.content_en,
                        metadata: {
                            master_name: aboutSettings.masterName,
                            master_title_fr: aboutSettings.masterTitle_fr,
                            master_title_en: aboutSettings.masterTitle_en,
                            quote_fr: aboutSettings.quote_fr,
                            quote_en: aboutSettings.quote_en,
                            initiations: aboutSettings.initiations,
                            expertise_fr: aboutSettings.expertise_fr,
                            expertise_en: aboutSettings.expertise_en,
                            team: aboutSettings.team,
                        }
                    }
                }).unwrap();
            } else if (activeTab === 'contact') {
                await updateContent({
                    section: 'contact',
                    data: {
                        title_fr: contactSettings.title_fr,
                        title_en: contactSettings.title_en,
                        subtitle_fr: contactSettings.subtitle_fr,
                        subtitle_en: contactSettings.subtitle_en,
                        description_fr: contactSettings.description_fr,
                        description_en: contactSettings.description_en,
                        metadata: {
                            whatsapp: contactSettings.whatsapp,
                            email: contactSettings.email,
                            location_fr: contactSettings.location_fr,
                            location_en: contactSettings.location_en,
                        }
                    }
                }).unwrap();
            } else if (activeTab === 'services') {
                // Handle services save through individual create/update operations
                toast('Use the individual buttons to save services');
                return;
            } else if (activeTab === 'formations') {
                await updateContent({
                    section: 'formations',
                    data: {
                        title_fr: formationSettings.title_fr,
                        title_en: formationSettings.title_en,
                        subtitle_fr: formationSettings.subtitle_fr,
                        subtitle_en: formationSettings.subtitle_en,
                        description_fr: formationSettings.description_fr,
                        description_en: formationSettings.description_en,
                        metadata: {
                            topics: formationSettings.topics,
                            packs: formationSettings.packs,
                        }
                    }
                }).unwrap();
            } else if (activeTab === 'pricing') {
                // Handle pricing save through individual create/update operations
                toast('Use the individual buttons to save plans');
                return;
            } else if (activeTab === 'social') {
                await updateContent({
                    section: 'social',
                    data: {
                        metadata: { ...socialMedia }
                    }
                }).unwrap();
            }

            toast.success('Settings saved successfully');
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error?.data?.message || 'Error while saving');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'home' as TabType, label: 'Home', icon: Home },
        { id: 'services' as TabType, label: 'Services', icon: Briefcase },
        { id: 'formations' as TabType, label: 'Training', icon: BookOpen },
        { id: 'pricing' as TabType, label: 'Pricing', icon: DollarSign },
        { id: 'about' as TabType, label: 'About', icon: Users },
        { id: 'contact' as TabType, label: 'Contact', icon: Mail },
        { id: 'social' as TabType, label: 'Social Media', icon: Share2 },
    ];

    const renderHomeSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Title (French)
                    </label>
                    <input
                        type="text"
                        value={homeSettings.title_fr}
                        onChange={(e) => setHomeSettings({ ...homeSettings, title_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Title (English)
                    </label>
                    <input
                        type="text"
                        value={homeSettings.title_en}
                        onChange={(e) => setHomeSettings({ ...homeSettings, title_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Subtitle (French)
                    </label>
                    <input
                        type="text"
                        value={homeSettings.subtitle_fr}
                        onChange={(e) => setHomeSettings({ ...homeSettings, subtitle_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Subtitle (English)
                    </label>
                    <input
                        type="text"
                        value={homeSettings.subtitle_en}
                        onChange={(e) => setHomeSettings({ ...homeSettings, subtitle_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Description (French)
                    </label>
                    <RichTextEditor
                        value={homeSettings.description_fr}
                        onChange={(value) => setHomeSettings({ ...homeSettings, description_fr: value })}
                        placeholder="Description in French..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Description (English)
                    </label>
                    <RichTextEditor
                        value={homeSettings.description_en}
                        onChange={(value) => setHomeSettings({ ...homeSettings, description_en: value })}
                        placeholder="Description in English..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                    Hero Image
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHomeSettings({ ...homeSettings, heroImage: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Primary CTA Text (French)
                    </label>
                    <input
                        type="text"
                        value={homeSettings.ctaText_fr}
                        onChange={(e) => setHomeSettings({ ...homeSettings, ctaText_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Primary CTA Text (English)
                    </label>
                    <input
                        type="text"
                        value={homeSettings.ctaText_en}
                        onChange={(e) => setHomeSettings({ ...homeSettings, ctaText_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Primary CTA Link
                    </label>
                    <input
                        type="text"
                        value={homeSettings.ctaLink}
                        onChange={(e) => setHomeSettings({ ...homeSettings, ctaLink: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                        placeholder="https://wa.me/22890000000"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Secondary CTA Text (French)
                    </label>
                    <input
                        type="text"
                        value={homeSettings.ctaSecondaryText_fr}
                        onChange={(e) => setHomeSettings({ ...homeSettings, ctaSecondaryText_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Secondary CTA Text (English)
                    </label>
                    <input
                        type="text"
                        value={homeSettings.ctaSecondaryText_en}
                        onChange={(e) => setHomeSettings({ ...homeSettings, ctaSecondaryText_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Secondary CTA Link
                    </label>
                    <input
                        type="text"
                        value={homeSettings.ctaSecondaryLink}
                        onChange={(e) => setHomeSettings({ ...homeSettings, ctaSecondaryLink: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                        placeholder="#services"
                    />
                </div>
            </div>
        </div>
    );

    const handleSaveService = async (service: any, index: number) => {
        try {
            const serviceData = {
                title_fr: service.title_fr,
                title_en: service.title_en,
                description_fr: service.description_fr,
                description_en: service.description_en,
                icon: service.icon,
                price_eur: service.price_eur,
                price_usd: service.price_usd,
                price_xof: service.price_xof,
                sort_order: index + 1,
                is_active: service.is_active !== undefined ? service.is_active : true,
            };

            const isPersisted = typeof service.id === 'number' || (typeof service.id === 'string' && !service.id.startsWith('temp-'));
            const serviceId = typeof service.id === 'string' ? parseInt(service.id, 10) : service.id;

            if (isPersisted && serviceId) {
                await updateService({ id: serviceId, data: serviceData }).unwrap();
                toast.success('Service updated successfully');
            } else {
                const result = await createService(serviceData).unwrap();
                const updated = [...services];
                updated[index].id = result.payload.id;
                setServices(updated);
                toast.success('Service created successfully');
            }
        } catch (error: any) {
            console.error('Save service error:', error);
            toast.error(error?.data?.message || 'Error while saving the service');
        }
    };

    const handleDeleteService = async (service: any) => {
        const isTempId = typeof service.id === 'string' && service.id.startsWith('temp-');

        if (!service.id || isTempId) {
            // Just remove from local state if not saved
            setServices(services.filter(s => s !== service));
            return;
        }

        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            const serviceId = typeof service.id === 'string' ? parseInt(service.id, 10) : service.id;
            await deleteService(serviceId).unwrap();
            setServices(services.filter(s => {
                const currentId = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
                return currentId !== serviceId;
            }));
            toast.success('Service deleted successfully');
        } catch (error: any) {
            console.error('Delete service error:', error);
            toast.error(error?.data?.message || 'Error while deleting the service');
        }
    };

    const renderServicesSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Services</h3>
                <button
                    onClick={() => setServices([...services, {
                        id: `temp-${Date.now()}`,
                        title_fr: '',
                        title_en: '',
                        description_fr: '',
                        description_en: '',
                        icon: 'consultation',
                        price_eur: 0,
                        price_usd: 0,
                        price_xof: 0,
                        sort_order: services.length + 1,
                        is_active: true,
                    }])}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                    + Add a service
                </button>
            </div>

            {services.map((service, index) => (
                <div key={service.id} className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-bg-secondary">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-text-primary">Service {index + 1}</h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSaveService(service, index)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => handleDeleteService(service)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                Title (French)
                            </label>
                            <input
                                type="text"
                                value={service.title_fr}
                                onChange={(e) => {
                                    const updated = [...services];
                                    updated[index].title_fr = e.target.value;
                                    setServices(updated);
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                Title (English)
                            </label>
                            <input
                                type="text"
                                value={service.title_en}
                                onChange={(e) => {
                                    const updated = [...services];
                                    updated[index].title_en = e.target.value;
                                    setServices(updated);
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                Description (French)
                            </label>
                            <textarea
                                value={service.description_fr}
                                onChange={(e) => {
                                    const updated = [...services];
                                    updated[index].description_fr = e.target.value;
                                    setServices(updated);
                                }}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                Description (English)
                            </label>
                            <textarea
                                value={service.description_en}
                                onChange={(e) => {
                                    const updated = [...services];
                                    updated[index].description_en = e.target.value;
                                    setServices(updated);
                                }}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                Icon
                            </label>
                            <select
                                value={service.icon}
                                onChange={(e) => {
                                    const updated = [...services];
                                    updated[index].icon = e.target.value;
                                    setServices(updated);
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            >
                                <option value="consultation">Consultation</option>
                                <option value="lecture">Reading</option>
                                <option value="bilan">Assessment</option>
                                <option value="livre">Book</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                Price (EUR)
                            </label>
                            <input
                                type="number"
                                value={service.price_eur}
                                onChange={(e) => {
                                    const updated = [...services];
                                    updated[index].price_eur = parseFloat(e.target.value);
                                    setServices(updated);
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                Price (USD)
                            </label>
                            <input
                                type="number"
                                value={service.price_usd}
                                onChange={(e) => {
                                    const updated = [...services];
                                    updated[index].price_usd = parseFloat(e.target.value);
                                    setServices(updated);
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                Price (XOF)
                            </label>
                            <input
                                type="number"
                                value={service.price_xof || 0}
                                onChange={(e) => {
                                    const updated = [...services];
                                    updated[index].price_xof = parseFloat(e.target.value);
                                    setServices(updated);
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderFormationsSection = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Title (French)
                    </label>
                    <input
                        type="text"
                        value={formationSettings.title_fr}
                        onChange={(e) => setFormationSettings({ ...formationSettings, title_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Title (English)
                    </label>
                    <input
                        type="text"
                        value={formationSettings.title_en}
                        onChange={(e) => setFormationSettings({ ...formationSettings, title_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Subtitle (French)
                    </label>
                    <input
                        type="text"
                        value={formationSettings.subtitle_fr}
                        onChange={(e) => setFormationSettings({ ...formationSettings, subtitle_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Subtitle (English)
                    </label>
                    <input
                        type="text"
                        value={formationSettings.subtitle_en}
                        onChange={(e) => setFormationSettings({ ...formationSettings, subtitle_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Description (French)
                    </label>
                    <textarea
                        value={formationSettings.description_fr}
                        onChange={(e) => setFormationSettings({ ...formationSettings, description_fr: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Description (English)
                    </label>
                    <textarea
                        value={formationSettings.description_en}
                        onChange={(e) => setFormationSettings({ ...formationSettings, description_en: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-bg-secondary space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-text-primary">Topics (pills)</h4>
                    <button
                        onClick={() => setFormationSettings({
                            ...formationSettings,
                            topics: [...formationSettings.topics, { icon: '☿', label_fr: '', label_en: '' }]
                        })}
                        className="text-sm px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black rounded-lg hover:shadow"
                    >
                        + Add a topic
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formationSettings.topics.map((topic, index) => (
                        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-text-secondary">Topic {index + 1}</span>
                                <button
                                    onClick={() => setFormationSettings({
                                        ...formationSettings,
                                        topics: formationSettings.topics.filter((_: any, i: number) => i !== index)
                                    })}
                                    className="text-red-600 hover:text-red-700 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Icon (emoji or name)"
                                value={topic.icon}
                                onChange={(e) => {
                                    const updated = [...formationSettings.topics];
                                    updated[index] = { ...topic, icon: e.target.value };
                                    setFormationSettings({ ...formationSettings, topics: updated });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                            />
                            <input
                                type="text"
                                placeholder="Label (FR)"
                                value={topic.label_fr}
                                onChange={(e) => {
                                    const updated = [...formationSettings.topics];
                                    updated[index] = { ...topic, label_fr: e.target.value };
                                    setFormationSettings({ ...formationSettings, topics: updated });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                            />
                            <input
                                type="text"
                                placeholder="Label (EN)"
                                value={topic.label_en}
                                onChange={(e) => {
                                    const updated = [...formationSettings.topics];
                                    updated[index] = { ...topic, label_en: e.target.value };
                                    setFormationSettings({ ...formationSettings, topics: updated });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Training packs</h3>
                <button
                    onClick={() => setFormationSettings({
                        ...formationSettings,
                        packs: [
                            ...formationSettings.packs,
                            {
                                id: `temp-${Date.now()}`,
                                title_fr: '',
                                title_en: '',
                                subtitle_fr: '',
                                subtitle_en: '',
                                price_eur: 0,
                                price_xof: 0,
                                period_fr: '/mois',
                                period_en: '/month',
                                duration_fr: '',
                                duration_en: '',
                                features_fr: [] as string[],
                                features_en: [] as string[],
                                is_premium: false,
                            }
                        ]
                    })}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                    + Add a pack
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {formationSettings.packs.map((pack, index) => (
                    <div key={pack.id || index} className="p-5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-bg-secondary space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium text-gray-900 dark:text-text-primary">Pack {index + 1}</h4>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-text-primary">
                                    <input
                                        type="checkbox"
                                        checked={!!pack.is_premium}
                                        onChange={(e) => {
                                            const updated = [...formationSettings.packs];
                                            updated[index] = { ...pack, is_premium: e.target.checked };
                                            setFormationSettings({ ...formationSettings, packs: updated });
                                        }}
                                    />
                                    Premium
                                </label>
                                <button
                                    onClick={() => setFormationSettings({
                                        ...formationSettings,
                                        packs: formationSettings.packs.filter((_: any, i: number) => i !== index)
                                    })}
                                    className="text-red-600 hover:text-red-700 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Title (FR)
                                </label>
                                <input
                                    type="text"
                                    value={pack.title_fr}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, title_fr: e.target.value };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Title (EN)
                                </label>
                                <input
                                    type="text"
                                    value={pack.title_en}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, title_en: e.target.value };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Subtitle (FR)
                                </label>
                                <input
                                    type="text"
                                    value={pack.subtitle_fr}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, subtitle_fr: e.target.value };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Subtitle (EN)
                                </label>
                                <input
                                    type="text"
                                    value={pack.subtitle_en}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, subtitle_en: e.target.value };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Price EUR
                                </label>
                                <input
                                    type="number"
                                    value={pack.price_eur || 0}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, price_eur: parseFloat(e.target.value) || 0 };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Price XOF
                                </label>
                                <input
                                    type="number"
                                    value={pack.price_xof || 0}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, price_xof: parseFloat(e.target.value) || 0 };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Period (FR)
                                </label>
                                <input
                                    type="text"
                                    value={pack.period_fr || ''}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, period_fr: e.target.value };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Period (EN)
                                </label>
                                <input
                                    type="text"
                                    value={pack.period_en || ''}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, period_en: e.target.value };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Duration (FR)
                                </label>
                                <input
                                    type="text"
                                    value={pack.duration_fr || ''}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, duration_fr: e.target.value };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Duration (EN)
                                </label>
                                <input
                                    type="text"
                                    value={pack.duration_en || ''}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, duration_en: e.target.value };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Features (FR) — one per line
                                </label>
                                <textarea
                                    rows={5}
                                    value={(pack.features_fr || []).join('\n')}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, features_fr: e.target.value.split('\n').filter(Boolean) };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                                    Features (EN) — one per line
                                </label>
                                <textarea
                                    rows={5}
                                    value={(pack.features_en || []).join('\n')}
                                    onChange={(e) => {
                                        const updated = [...formationSettings.packs];
                                        updated[index] = { ...pack, features_en: e.target.value.split('\n').filter(Boolean) };
                                        setFormationSettings({ ...formationSettings, packs: updated });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAboutSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Title (French)
                    </label>
                    <input
                        type="text"
                        value={aboutSettings.title_fr}
                        onChange={(e) => setAboutSettings({ ...aboutSettings, title_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Title (English)
                    </label>
                    <input
                        type="text"
                        value={aboutSettings.title_en}
                        onChange={(e) => setAboutSettings({ ...aboutSettings, title_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Subtitle (French)
                    </label>
                    <input
                        type="text"
                        value={aboutSettings.subtitle_fr}
                        onChange={(e) => setAboutSettings({ ...aboutSettings, subtitle_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Subtitle (English)
                    </label>
                    <input
                        type="text"
                        value={aboutSettings.subtitle_en}
                        onChange={(e) => setAboutSettings({ ...aboutSettings, subtitle_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Description (French)
                    </label>
                    <textarea
                        value={aboutSettings.description_fr}
                        onChange={(e) => setAboutSettings({ ...aboutSettings, description_fr: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Description (English)
                    </label>
                    <textarea
                        value={aboutSettings.description_en}
                        onChange={(e) => setAboutSettings({ ...aboutSettings, description_en: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Content (French)
                    </label>
                    <textarea
                        value={aboutSettings.content_fr}
                        onChange={(e) => setAboutSettings({ ...aboutSettings, content_fr: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Content (English)
                    </label>
                    <textarea
                        value={aboutSettings.content_en}
                        onChange={(e) => setAboutSettings({ ...aboutSettings, content_en: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="border-t border-gray-300 dark:border-gray-700 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4">Master Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Master Name
                        </label>
                        <input
                            type="text"
                            value={aboutSettings.masterName}
                            onChange={(e) => setAboutSettings({ ...aboutSettings, masterName: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Title (French)
                        </label>
                        <input
                            type="text"
                            value={aboutSettings.masterTitle_fr}
                            onChange={(e) => setAboutSettings({ ...aboutSettings, masterTitle_fr: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Master Title (English)
                        </label>
                        <input
                            type="text"
                            value={aboutSettings.masterTitle_en}
                            onChange={(e) => setAboutSettings({ ...aboutSettings, masterTitle_en: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Quote (French)
                        </label>
                        <textarea
                            value={aboutSettings.quote_fr}
                            onChange={(e) => setAboutSettings({ ...aboutSettings, quote_fr: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                            Quote (English)
                        </label>
                        <textarea
                            value={aboutSettings.quote_en}
                            onChange={(e) => setAboutSettings({ ...aboutSettings, quote_en: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-text-secondary">
                <p>Note: To edit initiations, areas of expertise and team, please edit the configuration file directly or use the API.</p>
            </div>
        </div>
    );

    const renderPricingSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Pricing plans</h3>
                <button
                    onClick={() => setPricingPlans([...pricingPlans, {
                        id: Date.now(),
                        name_fr: '',
                        name_en: '',
                        description_fr: '',
                        description_en: '',
                        price_eur: 0,
                        price_usd: 0,
                        features_fr: [],
                        features_en: [],
                        recommended: false,
                    }])}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                    + Add a plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pricingPlans.map((plan, index) => (
                    <div key={plan.id} className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-bg-secondary">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-text-primary">Plan {index + 1}</h4>
                            <button
                                onClick={() => setPricingPlans(pricingPlans.filter(p => p.id !== plan.id))}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name (FR)"
                                value={plan.name_fr}
                                onChange={(e) => {
                                    const updated = [...pricingPlans];
                                    updated[index].name_fr = e.target.value;
                                    setPricingPlans(updated);
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Name (EN)"
                                value={plan.name_en}
                                onChange={(e) => {
                                    const updated = [...pricingPlans];
                                    updated[index].name_en = e.target.value;
                                    setPricingPlans(updated);
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Price EUR"
                                    value={plan.price_eur}
                                    onChange={(e) => {
                                        const updated = [...pricingPlans];
                                        updated[index].price_eur = parseFloat(e.target.value);
                                        setPricingPlans(updated);
                                    }}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                />
                                <input
                                    type="number"
                                    placeholder="Price USD"
                                    value={plan.price_usd}
                                    onChange={(e) => {
                                        const updated = [...pricingPlans];
                                        updated[index].price_usd = parseFloat(e.target.value);
                                        setPricingPlans(updated);
                                    }}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                                />
                            </div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={plan.recommended}
                                    onChange={(e) => {
                                        const updated = [...pricingPlans];
                                        updated[index].recommended = e.target.checked;
                                        setPricingPlans(updated);
                                    }}
                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-text-secondary">Recommended</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContactSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Title (French)
                    </label>
                    <input
                        type="text"
                        value={contactSettings.title_fr}
                        onChange={(e) => setContactSettings({ ...contactSettings, title_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Title (English)
                    </label>
                    <input
                        type="text"
                        value={contactSettings.title_en}
                        onChange={(e) => setContactSettings({ ...contactSettings, title_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Subtitle (French)
                    </label>
                    <input
                        type="text"
                        value={contactSettings.subtitle_fr}
                        onChange={(e) => setContactSettings({ ...contactSettings, subtitle_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Subtitle (English)
                    </label>
                    <input
                        type="text"
                        value={contactSettings.subtitle_en}
                        onChange={(e) => setContactSettings({ ...contactSettings, subtitle_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Description (French)
                    </label>
                    <textarea
                        value={contactSettings.description_fr}
                        onChange={(e) => setContactSettings({ ...contactSettings, description_fr: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Description (English)
                    </label>
                    <textarea
                        value={contactSettings.description_en}
                        onChange={(e) => setContactSettings({ ...contactSettings, description_en: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        WhatsApp
                    </label>
                    <input
                        type="text"
                        value={contactSettings.whatsapp}
                        onChange={(e) => setContactSettings({ ...contactSettings, whatsapp: e.target.value })}
                        placeholder="22890000000"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={contactSettings.email}
                        onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Location (French)
                    </label>
                    <input
                        type="text"
                        value={contactSettings.location_fr}
                        onChange={(e) => setContactSettings({ ...contactSettings, location_fr: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2">
                        Location (English)
                    </label>
                    <input
                        type="text"
                        value={contactSettings.location_en}
                        onChange={(e) => setContactSettings({ ...contactSettings, location_en: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                </div>
            </div>
        </div>
    );

    const renderSocialSection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(socialMedia).map(([platform, url]) => (
                    <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-2 capitalize">
                            {platform}
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setSocialMedia({ ...socialMedia, [platform]: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-bg-secondary text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all"
                            placeholder={`https://${platform}.com/...`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-bg-primary p-4 sm:p-6 lg:p-8 overflow-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1"
                        style={{
                            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                        Homepage Configuration
                    </h1>
                    <p className="text-gray-600 dark:text-text-tertiary mt-1 text-sm sm:text-base">
                        Manage your public homepage content
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
                    <div className="flex gap-2 p-2 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md'
                                            : 'text-gray-600 dark:text-text-tertiary hover:bg-gray-100 dark:hover:bg-bg-secondary'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-bg-tertiary rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
                    {activeTab === 'home' && renderHomeSection()}
                    {activeTab === 'services' && renderServicesSection()}
                    {activeTab === 'formations' && renderFormationsSection()}
                    {activeTab === 'pricing' && renderPricingSection()}
                    {activeTab === 'about' && renderAboutSection()}
                    {activeTab === 'contact' && renderContactSection()}
                    {activeTab === 'social' && renderSocialSection()}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPageSettings;
