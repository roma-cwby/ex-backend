const express = require('express');
const validateBody = require('../helpers/validateSchemas');
const authenticate = require('../middlewares/authenticate');
const isValidId = require('../middlewares/isValidId');
const { addPostSchema, addCommentarySchema } = require('../models/posts');
const ctrl = require('../controllers/posts');

const router = express.Router();

router.post('/', authenticate, validateBody(addPostSchema), ctrl.add);

router.get('/', ctrl.get);

router.get('/search', ctrl.search);

router.get('/own', authenticate, ctrl.getOwn);

router.get('/:id', isValidId, ctrl.getById);

router.put('/:id', authenticate, isValidId, validateBody(addPostSchema), ctrl.update);

router.delete('/:id', authenticate, isValidId, ctrl.deletePost);

router.patch('/:id', authenticate, isValidId, ctrl.toggleLike);

router.patch(
  '/:id/commentary',
  authenticate,
  isValidId,
  validateBody(addCommentarySchema),
  ctrl.addCommentary
);

router.patch(
  '/:id/commentary/:commentId',
  authenticate,
  isValidId,
  validateBody(addCommentarySchema),
  ctrl.updateCommentary
);

router.delete('/:id/commentary/:commentId', authenticate, isValidId, ctrl.deleteCommentary);

module.exports = router;
