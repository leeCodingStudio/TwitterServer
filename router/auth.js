/*
    회원가입 -> post, /signup
    name: 빈문자X (notEmpty())
    email: 이메일형식체크, 모두 소문자
    url: url체크(isURL())
    

    로그인 -> post, /login
    username: 공백x, 빈문자x
    password: 공백x, 최소 4자 이상
*/

import express from 'express';
// import * as tweetController from '../controller/tweet.js'
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js'
import * as authController from '../controller/auth.js'
import { isAuth } from '../middleware/auth.js'


const router = express.Router();

//로그인할 때
const validateCredential = [
    body('username')
        .trim()
        .notEmpty()
        .isLength({min:4})
        .withMessage('아이디는 최소 4자 이상 입력하세요'),
    body('password')
        .trim()
        .notEmpty()
        .isLength({min:4})
        .withMessage('비밀번호는 최소 4자 이상 입력하세요'),
    validate
]

// 회원가입할 때 -로그인에서 id랑 pw조건은 동일하기 때문에 복사하면됨!
const validateSignup = [
    ...validateCredential,
    body('name').notEmpty().withMessage('이름을 꼭 입력하세요'),
    body('email').isEmail().normalizeEmail().withMessage('이메일 형식으로 입력하세요'),
    body('url').isURL().withMessage('url을 입력하세요')
        .optional({nullable: true, checkFalsy: true}),   //nullable :true, checkFalsy: true ->null 또는 false, 0, ''(빈 문자열)과 같은 falsy한 값이면 유효성 검사를 건너뛰도록 지정
    validate
]

router.post('/signup',validateSignup, authController.signup);
router.post('/login', validateCredential, authController.login);
router.get('/me', isAuth, authController.me);

export default router;