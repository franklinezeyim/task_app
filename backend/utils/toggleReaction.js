export const toggleReaction = ({
  reactions,
  reactionType,
  userId
}) => {
  let changed = false;

  // Did user already react with this type?
  const alreadyReacted = reactions[reactionType]?.some(
    id => id.toString() === userId
  );

  // Remove user from all reactions
  Object.keys(reactions).forEach(type => {
    reactions[type] = reactions[type].filter(
      id => id.toString() !== userId
    );
  });

  // If not already reacted, add new reaction
  if (!alreadyReacted) {
    reactions[reactionType].push(userId);
    changed = true;
  }

  return { reactions, changed };
};
