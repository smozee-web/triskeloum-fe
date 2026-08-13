export interface Level {
    id: number;
    created_at: string;
    updated_at: string;
    rank: number;
    name: string;
    is_public: boolean;
}

export interface Section {
    id: number;
    created_at: string;
    updated_at: string;
    title: string;
    order: number;
    content: {
        cover: string;
        summary: string;
        parts: {
            title: string;
            content: string;
        }[];
    };
}

export interface Course {
    id: number;
    created_at: string;
    updated_at: string;
    title: string;
    published: boolean;
    cover: string;
    legend: string;
    est_time_min: number;
    levels: Level[];
    category: Category;
    sections?: Section[];
    hasMediaContent?: boolean;
    mediaUrl?: string;
    mediaType?: 'VIDEO' | 'AUDIO';
}

export interface CourseStats {
    total: number;
    published: number;
    draft: number;
    byLevel: {
        levelName: string;
        count: number;
    }[];
}

export interface Category {
    id: number;
    title: string;
    cover?: string;
    created_at: string;
    updated_at: string;
    courses_count?: number;
}

export interface CategoryFormData {
    title: string;
    cover?: string;
}

export interface CategoriesResponse {
    categories: Category[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    payload: T;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    data: any;
}

export interface DashboardKPIs {
    totalUsers: number;
    newUsersWeek: number;
    newUsersMonth: number;
    usersGrowth: string;
    totalCourses: number;
    publishedCourses: number;
    messagesToday: number;
    messagesWeek: number;
    activeUsers: number;
    activeUsersPercentage: string;
}

export interface CourseStats {
    total: number;
    published: number;
    draft: number;
}

export interface TopCourse {
    id: number;
    title: string;
    enrollments: number;
    rating: string;
}

export interface DashboardOverview {
    kpis: DashboardKPIs;
    courseStats: CourseStats;
    topCourses: TopCourse[];
}

export interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    role: string;
    created_at: string;
    last_login?: string;
    picture?: string;
    level: {
        name: string;
        rank: number;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface UsersResponse {
    users: User[];
    pagination: PaginationMeta;
}

export enum VisitPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum VisitType {
    WALK_IN = 'WALK_IN',
    PRE_SCHEDULED = 'PRE_SCHEDULED',
    RECURRING = 'RECURRING'
}

export enum VisitPurpose {
    MEETING = 'MEETING',
    INTERVIEW = 'INTERVIEW',
    DELIVERY = 'DELIVERY',
    CONSULTATION = 'CONSULTATION',
    TRAINING = 'TRAINING',
    MAINTENANCE = 'MAINTENANCE',
    SALES = 'SALES',
    SUPPORT = 'SUPPORT',
    OTHER = 'OTHER'
}

export interface AssignmentFormData {
    employeeId: string;
    visitId: string; // Obligatoire maintenant
    visitPurpose: VisitPurpose;
    priority: VisitPriority;
    visitType: VisitType;
    estimatedDuration?: number;
    notes: string;
}


export const getNotificationColor = (type: string): string => {
    switch (type) {
        case 'VISIT_REQUEST':
            return 'blue';
        case 'VISIT_ACCEPTED':
            return 'green';
        case 'VISIT_REJECTED':
            return 'red';
        case 'VISIT_RESCHEDULED':
            return 'orange';
        case 'VISITOR_ARRIVED':
            return 'cyan';
        case 'VISIT_CANCELLED':
            return 'volcano';
        case 'VISIT_COMPLETED':
            return 'lime';
        default:
            return 'default';
    }
};

export interface ReceptionistFormProps {
    form: any;
    companies: any[];
    loading?: boolean;
}

export interface EmployeeFormProps {
    form: any;
    companies: any[];
    loading?: boolean;
}

export interface UserFilters {
    page: number;
    limit: number;
    role?: string;
    companyId?: string;
    search?: string;
    isActive?: string;
}

export interface NewCompanyProps {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export interface CompanyFormData {
    name: string;
    address: string;
    email?: string;
    phone?: string;
}

export interface Company {
    _id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    stats?: {
        employees: number;
        receptionists: number;
        pendingApprovals: number;
        totalUsers: number;
    };
}

export interface CompanyFilters {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface UserFilters {
    page: number;
    limit: number;
    role?: string;
    companyId?: string;
    search?: string;
    status?: string;
}

export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'PENDING':
            return 'orange';
        case 'ACCEPTED':
            return 'blue';
        case 'REJECTED':
            return 'red';
        case 'CHECKED_IN':
            return 'green';
        case 'CHECKED_OUT':
            return 'gray';
        case 'RESCHEDULED':
            return 'purple';
        case 'NO_SHOW':
            return 'volcano';
        default:
            return 'default';
    }
};

export const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case 'LOW':
            return 'green';
        case 'MEDIUM':
            return 'blue';
        case 'HIGH':
            return 'orange';
        case 'URGENT':
            return 'red';
        default:
            return 'default';
    }
};

export interface VisitTableProps {
    visits: any[];
    onCheckIn?: (visitId: string) => void;
    onCheckOut?: (visitId: string) => void;
    loading?: boolean;
    showActions?: boolean;
}

// src/utils/typeDef.ts (ajoutez/mettez à jour)

export interface SectionPart {
    title: string;
    content: string; // Markdown string
}

export interface SectionMedia {
    url: string;
    type: 'AUDIO' | 'VIDEO';
}

export interface SectionContent {
    cover: string;
    summary: string; // Markdown string
    parts: SectionPart[];
    media?: SectionMedia[];
}

export interface Section {
    id: number;
    title: string;
    order: number;
    content: SectionContent;
}

export interface Service {
    id: string;
    titleFr: string;
    titleEn: string;
    descriptionFr: string;
    descriptionEn: string;
    priceGhs: number;
    priceUsd: number;
    icon: string;
    duration?: string;
}

export interface Formation {
    id: string;
    titleFr: string;
    titleEn: string;
    descriptionFr: string;
    descriptionEn: string;
    priceGhs: number;
    priceUsd: number;
    duration: string;
    features: { fr: string; en: string }[];
    isPremium?: boolean;
}

export interface TeamMember {
    id: string;
    name: string;
    roleFr: string;
    roleEn: string;
    image: string;
}

export type Language = 'fr' | 'en' | 'ar';