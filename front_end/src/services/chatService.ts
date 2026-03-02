import { supabase } from '../supabaseClient';

export const chatService = {
  async sendMessage(senderId: string, receiverId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id: senderId, receiver_id: receiverId, content }]);
    if (error) throw error;
    return data;
  },

  async getMessages(myId: string, friendId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq."${myId}",receiver_id.eq."${friendId}"),and(sender_id.eq."${friendId}",receiver_id.eq."${myId}")`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }
};