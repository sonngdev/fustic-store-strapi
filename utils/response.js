module.exports.removeUserInfo = (entity) => {
  const clone = { ...entity };
  delete clone.created_by;
  delete clone.updated_by;
  return clone;
}
