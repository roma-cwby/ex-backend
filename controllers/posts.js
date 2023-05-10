const { Post } = require('../models/posts');
const { User } = require('../models/users');
const httpError = require('../helpers/httpError');
const ctrlWrapper = require('../helpers/ctrlWrapper');

const add = async (req, res) => {
  const { _id: owner } = req.user;
  const data = await Post.create({ owner, ...req.body });
  res.status(201).json(data);
};

const get = async (req, res) => {
  //const { page = 1, limit = 2 } = req.query;
  //const skip = (page - 1) * limit;

  const data = await Post.find({}).populate('owner', '_id name avatarURL').sort({createdAt:-1});
  res.status(200).json(data);
};

const search = async (req, res) => {
  let data = null;

  if (!req.query.genres)
    data = await Post.find({ $text: { $search: `${req.query.q}` } }).populate(
      'owner',
      '_id name avatarURL'
    ).sort({createdAt:-1});

  if (req.query.q && req.query.genres) {
    const genres = req.query.genres.split('-');
    data = await Post.find({ $text: { $search: `${req.query.q}` } })
      .populate('owner', '_id name avatarURL')
      .where('genres')
      .in(genres).sort({createdAt:-1});
  }

  if (!req.query.q) {
    const genres = req.query.genres.split('-');
    data = await Post.find({}).populate('owner', '_id name avatarURL').where('genres').in(genres).sort({createdAt:-1});
  }

  if (!data) throw httpError(404);

  res.status(200).json(data);
};

const getById = async (req, res) => {
  const data = await Post.findById(req.params.id).populate('owner', '_id name avatarURL');

  if (!data) throw httpError(404);

  const reactionsId = [...data.likes];

  data.comments.map(item => {
    if (!reactionsId.includes(item.owner._id)) reactionsId.push(item.owner._id);
  });

  const reactionsOwners = await User.find({}, '_id email name avatarURL')
    .where('_id')
    .in(reactionsId);

  res.status(200).json({ ...data._doc, reactionsOwners });
};

const getOwn = async (req, res) => {
  const { _id: owner } = req.user;
  //const { page = 1, limit = 2 } = req.query;
  //const skip = (page - 1) * limit;

  const data = await Post.find({ owner }).populate('owner', '_id name avatarURL').sort({createdAt:-1});
  res.status(200).json(data);
};

const update = async (req, res) => {
  const data = await Post.findById(req.params.id);

  if (!data) throw httpError(404);

  if (!data.owner.equals(req.user._id)) throw httpError(401, 'There are no rights to change');

  const response = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });

  res.status(200).json(response);
};

const deletePost = async (req, res) => {
  const data = await Post.findById(req.params.id);

  if (!data) throw httpError(404);

  if (!data.owner.equals(req.user._id)) throw httpError(401, 'There are no rights to delete');

  const response = await Post.findByIdAndDelete(req.params.id);

  res.status(200).json(response);
};

const toggleLike = async (req, res) => {
  const data = await Post.findById(req.params.id);

  if (!data) throw httpError(404);

  if (data.likes.includes(req.user._id.toString())) {
    const arr = data.likes.filter(item => !item.equals(req.user._id));
    await Post.findByIdAndUpdate(req.params.id, {
      likes: arr,
    });
    res.status(200).json({ message: 'You like deleted' });
  } else {
    await Post.findByIdAndUpdate(req.params.id, {
      likes: [req.user._id.toString(), ...data.likes],
    });

    res.status(200).json({ message: 'Like added' });
  }
};

const addCommentary = async (req, res) => {
  const data = await Post.findById(req.params.id);

  if (!data) throw httpError(404);

  await Post.findByIdAndUpdate(req.params.id, {
    comments: [{ owner: req.user._id, text: req.body.text }, ...data.comments],
  });

  res.status(200).json({ message: 'Commentary added' });
};

const updateCommentary = async (req, res) => {
  const data = await Post.findById(req.params.id);

  if (!data) throw httpError(404);

  const commentary = data.comments.find(item => item._id.equals(req.params.commentId));
  if (!commentary.owner.equals(req.user._id))
    throw httpError(401, 'There are no rights to update this commentary');

  let commentaryArr = data.comments;

  commentaryArr.map(item => {
    if (item._id.equals(req.params.commentId)) item.text = req.body.text;
  });

  await Post.findByIdAndUpdate(req.params.id, { comments: commentaryArr });

  res.status(200).json({ message: 'Commentary updated' });
};

const deleteCommentary = async (req, res) => {
  const data = await Post.findById(req.params.id);

  if (!data) throw httpError(404);

  const commentary = data.comments.find(item => item._id.equals(req.params.commentId));
  if (!commentary.owner.equals(req.user._id))
    throw httpError(401, 'There are no rights to delete this commentary');

  const newCommentary = data.comments.filter(item => !item._id.equals(req.params.commentId));

  await Post.findByIdAndUpdate(req.params.id, { comments: newCommentary });

  res.status(200).json({ message: 'Commentary deleted' });
};

module.exports = {
  add: ctrlWrapper(add),
  get: ctrlWrapper(get),
  getById: ctrlWrapper(getById),
  getOwn: ctrlWrapper(getOwn),
  update: ctrlWrapper(update),
  deletePost: ctrlWrapper(deletePost),
  toggleLike: ctrlWrapper(toggleLike),
  addCommentary: ctrlWrapper(addCommentary),
  deleteCommentary: ctrlWrapper(deleteCommentary),
  updateCommentary: ctrlWrapper(updateCommentary),
  search: ctrlWrapper(search),
};
