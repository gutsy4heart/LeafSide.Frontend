export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

export interface BookRating {
  bookId: string;
  averageRating: number;
  reviewCount: number;
}

export interface CreateReviewRequest {
  bookId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
}

