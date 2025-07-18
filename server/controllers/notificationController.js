// likeController.js
await Notification.create({
  sender: senderId,
  receiver: receiverId,
  type: 'like',
  psot: post._id
});

// comment
await Notification.create({
  sender: req.user._id,
  receiver: post.owner._id,
  type: 'comment',
  post: post._id
});
        
// follower
await Notification.create({
  sender: req.user._id,
  receiver: userToFollow._id,
  type: 'follow'
});
