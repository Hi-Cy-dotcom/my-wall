export interface Post {
  id: string;
  author: string;
  message: string;
  created_at: string;
  image_url?: string | null;
}
