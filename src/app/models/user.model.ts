export interface User {
  id: string;
  name: string;
  email: string;
  planType: 'basic' | 'premium' | 'admin';
}