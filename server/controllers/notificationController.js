const { supabase } = require('../config/supabase');
const Logger = require('../utils/logger');
const { asyncHandler } = require('../utils/errorHandler');

const logger = new Logger('NOTIFICATION_CONTROLLER');

/**
 * Get user notifications
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly === 'true') {
    query = query.eq('read', false);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  res.json({
    notifications: data,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    unreadCount: data.filter(n => !n.read).length
  });
});

/**
 * Mark notification as read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  res.json({ notification: data, message: 'Notification marked as read' });
});

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;

  res.json({ message: 'All notifications marked as read' });
});

/**
 * Delete notification
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;

  res.json({ message: 'Notification deleted' });
});

/**
 * Get unread count
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;

  res.json({ unreadCount: count || 0 });
});

/**
 * Create notification (admin/system use)
 */
exports.createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, data } = req.body;

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data: data || {}
    })
    .select()
    .single();

  if (error) throw error;

  logger.info('Notification created', { notificationId: notification.id, userId });

  res.status(201).json({ notification, message: 'Notification created' });
});
