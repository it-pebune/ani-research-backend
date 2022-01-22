/**
 * @apiDefine UserInfo
 * @apiSuccess {number} id User unique ID
 * @apiSuccess {string} firstName
 * @apiSuccess {string} lastName
 * @apiSuccess {string} displayName
 * @apiSuccess {string} email
 * @apiSuccess {number} roleId
 * @apiSuccess {date} created Date of creation
 * @apiSuccess {date} updated Last update date
 * @apiSuccess {string} provider 'Google'
 * @apiSuccess {string} profileImageURL Path of the profile image (not used)
 * @apiSuccess {number} status 0 - not validated, 1 - validated
 */

/**
 * @apiDefine UnknownError
 * @apiError (500) {String} UnknownError Unknown server error
 * @apiErrorExample {json} Error-Response:
 * HTTP 1/1 500
 * {
 *  code: INTERNAL_ERROR,
 *  message: 'Internal server error'
 * }
 */
