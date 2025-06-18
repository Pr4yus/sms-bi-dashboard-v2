import { ObjectId } from 'mongodb';

interface MessageDistribution {
  incoming: number;
  outgoing: number;
}

interface QualityIndicators {
  response_rate: string;
  completion_rate: string;
}

interface ResponseTimes {
  first_reply_seconds: number | null;
  avg_response_seconds: number;
}

interface ConversationMetrics {
  total: number;
  new_profiles: number;
  returning_profiles: number;
}

interface MessagePatterns {
  avg_messages_per_conversation: number;
  messages_distribution: MessageDistribution;
}

interface ChannelMetrics {
  conversations: ConversationMetrics;
  response_times: ResponseTimes;
  message_patterns: MessagePatterns;
  quality_indicators: QualityIndicators;
}

interface Channel {
  channel: string;
  metrics: ChannelMetrics;
}

interface ChannelDistribution {
  channel: string;
  percentage: string;
}

interface PeakHours {
  busiest_hour: number;
  quietest_hour: number;
  weekend_percentage: string;
}

interface Profiles {
  new: number;
  returning: number;
  conversion_rate: string;
}

interface Engagement {
  avg_session_duration: number;
  response_rate: string;
  completion_rate: string;
}

interface TotalMetrics {
  conversations: number;
  profiles: Profiles;
  engagement: Engagement;
  peak_hours: PeakHours;
}

export interface ConversationInsight {
  _id: ObjectId;
  date: string;
  account_uid: ObjectId;
  account_name: string;
  client_id: string;
  total_metrics: TotalMetrics;
  channels: Channel[];
  channel_distribution: ChannelDistribution[];
  last_updated: Date;
  updated_by: string;
} 