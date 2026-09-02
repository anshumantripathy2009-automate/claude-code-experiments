// Supabase-backed conversation store, keyed by phone number + client_slug.
// Vercel serverless functions get a fresh instance per request, so this
// (not an in-memory object) is what lets the receptionist remember a
// patient across messages.

const supabase = require('./supabase-client');

const MAX_MESSAGES = 20;

// Returns the stored message array for this phone/client, or [] if there's
// no row yet or Supabase is unreachable/misconfigured — the agent should
// still be able to start a fresh conversation either way.
async function getConversation(phoneNumber, clientSlug = 'smile-dental') {
  if (!supabase) {
    console.warn('[conversation-store] Supabase client not configured — returning empty history.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('messages')
      .eq('phone_number', phoneNumber)
      .eq('client_slug', clientSlug)
      .single();

    if (error || !data) {
      console.log(`📥 Loaded 0 messages for ${phoneNumber}`);
      return [];
    }

    const messages = data.messages || [];
    console.log(`📥 Loaded ${messages.length} messages for ${phoneNumber}`);
    return messages;
  } catch (err) {
    console.error('[conversation-store] getConversation failed:', err);
    return [];
  }
}

// Appends one message ({ role, text }), trims to the last MAX_MESSAGES, and
// upserts the row. Returns the trimmed array either way, so callers can keep
// going even if the save itself silently failed.
async function addMessage(phoneNumber, message, clientSlug = 'smile-dental') {
  const existing = await getConversation(phoneNumber, clientSlug);
  const updated = [...existing, message];
  const trimmed = updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;

  if (!supabase) {
    console.warn('[conversation-store] Supabase client not configured — skipping save.');
    return trimmed;
  }

  try {
    const { error } = await supabase
      .from('conversations')
      .upsert(
        { phone_number: phoneNumber, client_slug: clientSlug, messages: trimmed },
        { onConflict: 'phone_number,client_slug' }
      );

    if (error) {
      console.error('[conversation-store] Failed to save conversation:', error);
      return trimmed;
    }

    console.log(`💾 Saved ${trimmed.length} messages for ${phoneNumber}`);
    return trimmed;
  } catch (err) {
    console.error('[conversation-store] addMessage failed:', err);
    return trimmed;
  }
}

async function clearConversation(phoneNumber, clientSlug = 'smile-dental') {
  if (!supabase) {
    console.warn('[conversation-store] Supabase client not configured — skipping clear.');
    return;
  }

  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('phone_number', phoneNumber)
      .eq('client_slug', clientSlug);

    if (error) {
      console.error('[conversation-store] Failed to clear conversation:', error);
    }
  } catch (err) {
    console.error('[conversation-store] clearConversation failed:', err);
  }
}

module.exports = {
  getConversation,
  addMessage,
  clearConversation,
};
