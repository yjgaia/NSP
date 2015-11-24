# Node Server Pages
Node Server Pages는 Node.js를 기반으로 동적 웹페이지를 생성하기 위해 개발된 서버 스크립트 엔진입니다.

## 특징
- 멀티코어 CPU를 지원합니다.

## 설정
`config.json` 파일을 수정해서 사용합니다.
```json
{
	"port": 8080,
	"isDevMode": true,
	"rootPath": "./"
}
```

## 실행
```
node NSP.js
```

## 예
```nsp
<!DOCTYPE html>
<html>
	<body>
		<h1>My first NSP page</h1>
		<%
			print('Hello World!');
		%>
	</body>
</html>
```