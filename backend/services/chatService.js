const extractKeywordReply = (normalizedMessage) => {
  if (normalizedMessage.includes('protein')) {
    return 'Aim for consistent protein in each meal. A practical range is around 1.6 to 2.2 g per kg body weight, depending on your goal and training load.';
  }

  if (normalizedMessage.includes('sleep')) {
    return 'Try to protect 7 to 9 hours of sleep. Keep your sleep and wake times stable, and reduce screens 30 to 60 minutes before bed.';
  }

  if (normalizedMessage.includes('cardio')) {
    return 'Start with 20 to 30 minutes of moderate cardio 3 to 4 times per week, then increase gradually based on recovery and consistency.';
  }

  if (normalizedMessage.includes('weight loss') || normalizedMessage.includes('fat loss')) {
    return 'For fat loss, combine a small calorie deficit, strength training, and daily activity. Avoid extreme cuts so you can sustain progress.';
  }

  if (normalizedMessage.includes('muscle')) {
    return 'For muscle gain, prioritize progressive overload, sufficient protein, and enough sleep. Track lifts weekly so you can see trends.';
  }

  if (normalizedMessage.includes('water') || normalizedMessage.includes('hydrate')) {
    return 'A simple hydration target is around 2 to 3 liters per day, then adjust for heat, sweat, and workout duration.';
  }

  return null;
};

const generateCoachReply = ({ message, userProfile }) => {
  const normalizedMessage = String(message || '').trim().toLowerCase();
  const profileMode = userProfile?.mode || 'maintenance';

  const keywordReply = extractKeywordReply(normalizedMessage);

  if (keywordReply) {
    return `${keywordReply} Based on your current mode (${profileMode}), keep your plan realistic for the next 7 days and review outcomes weekly.`;
  }

  return `Thanks for sharing. For your current mode (${profileMode}), I suggest focusing on one nutrition habit, one training target, and one recovery target this week. If you want, I can help you break that into a simple daily checklist.`;
};

module.exports = {
  generateCoachReply,
};
