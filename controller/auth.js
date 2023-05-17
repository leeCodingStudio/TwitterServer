import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import * as userRepository from '../data/auth.js'
import {config}  from '../config.js'

/*const jwtSecretKey = 'HT!sfh99Ec0Ggr5jGpjD%7xtZgdi4#TU';  // 32글자의 secret key 생성
const jwtExpireInDays = '2d'   // 이틀동안 토큰 사용 가능
const bcryptSaltRounds = 10  // 몇번의 salt값으로 알고리즘을 실행할 것인지*/

export async function signup(req, res){
    //req.body로 데이터를 받아 회원가입을 하는 함수
    //해당 아이디가 존재한다면 409를 리턴(이미 가입되어있음)
    //userRepository에 데이터를 저장(비밀번호는 bcrypt를 사용하여 저장)
    //JWT를 이용하여 사용자에게 json으로 전달
    const  {username, password, name, email, url} = req.body
    const found = await userRepository.findByUsername(username);  // 찾았으면 found에 객체가 담김(username이 이미 있는지)
    if (found) {
        return res.status(409).json({message: `${username}은 이미 가입되었습니다.`})
    }
    // hash(): 비동기적으로 문자열을 해시 값(고정 길이의 문자열)으로 변환하는 함수
    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds)
    const userId = await userRepository.createUser({
        username,  // 프로퍼티명과 변수명이 같으면 하나만 써도됨!
        password: hashed,   // 다른경우는 다르게 써줌
        name,
        email,
        url
    });
    const token = createJwtToken(userId)
    res.status(201).json({token, username})  // jwt로 생성된 userId의 token값과 username을 json으로 사용자에게 전달
    
}

export async function login(req, res){
    //req.body로 데이터를 받아 해당 아이디로 로그인 여부를 판단
    //해당 아이디가 존재하지 않으면 401를 리턴(미가입 회원)
    //bcrypt를 이용하여 비밀번호까지 모두 맞다면 해당 정보를 JWT를 이용하여 사용자에게 json으로 전달
    const { username, password} = req.body
    const user = await userRepository.findByUsername(username)  // 아이디 객체를 가져옴
     // 아이디가 없으면
    if(!user){  
        return res.status(401).json({message: '해당 아이디가 존재하지 않습니다.'})
    }
    const isValiePassword = await bcrypt.compare(password, user.password)  // compare(): 같은지 틀린지 반환
    //다르다면
    if(!isValiePassword){  
        return res.status(401).json({message: '아이디 또는 비밀번호를 확인하세요!'})
    }
    const token = createJwtToken(user.id)
    res.status(200).json({token, username})  // jwt로 생성된 userId의 token값과 username을 json으로 사용자에게 전달
}

//로그인이 끊어졌는지 확인할 수 있는 함수
export async function me(req, res, next){
    const user = await userRepository.findById(req.userId);
    if(!user){
        return res.status(404).json({message:'사용자가 존재하지 않습니다.'});
    }
    res.status(200).json({token: req.token, username: user.username})
}


//token을 생성해주는 함수
//id를 넣으면 sign메서드에 의해 token 생성
function createJwtToken(id) {
    return jwt.sign({id}, config.jwt.secretKey, {expiresIn:config.jwt.expiresInSec})  
}