const router = require("express").Router();
const Message = require("../models/Message");
const auth = require("../middleware/auth");
const GroupsParticipants = require("../models/groupParticipants");

// add message
router.post("/", auth, async (req, res) => {
  try {
    const { message, groupId } = req.body;
    if (!(message && groupId)) {
      return res
        .status(400)
        .json({ message: "Please provide all information." });
    }
    await Message.create({
      groupId,
      message,
      senderDetails: {
        email: req.user.email,
        fullName: req.user.fullName,
        username: req.user.username,
        profilePicture: req.user.profilePicture,
        role: req.user.role,
      },
    });
    const groupMessages = await Message.find({ groupId: groupId });
    const io = req.app.get("socketio");
    io.to(groupId).emit("updatedMessages", {
      groupId,
      messages: groupMessages,
    });
    return res.status(200).json({ messages: groupMessages });
  } catch (error) {
    return res.status(500).json(error);
  }
});

// fetch message
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json(error);
  }
});

// fetch all messages
router.get("/", auth, async (req, res) => {
  try {
    const messages = [];
    const mygroups = await GroupsParticipants.find({
      userId: req.user._id,
    });

    //
    for (let i = 0; i < mygroups.length; i++) {
      const ms = await Message.find({ groupId: mygroups[i].groupId });
      messages.push({ groupId: mygroups[i]._doc.groupId, messages: ms });
    }
    //

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
