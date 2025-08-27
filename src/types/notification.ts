export interface Notification {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  userIdRecipients: {
    _id: string;
    name: string;
    email: string;
  }[];
  userIdSender: {
    _id: string;
    name: string;
    email: string;
  };
  userIdRead: string[];
  read?: boolean; // Campo calculado que se agrega dinámicamente
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
  error?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  data: Notification;
  message: string;
  error?: string;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  data: {
    modifiedCount: number;
  };
  message: string;
  error?: string;
}
