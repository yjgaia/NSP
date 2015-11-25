# Node Server Pages
Node Server Pages는 Node.js를 기반으로 동적 웹페이지를 생성하기 위해 개발된 서버 스크립트 엔진입니다.

## 특징
- 멀티코어 CPU를 지원합니다.
- [Node.js의 API](https://nodejs.org/api/)를 모두 사용할 수 있습니다.
- [UPPERCASE.JS](https://github.com/Hanul/UPPERCASE.JS)의 [COMMON](https://github.com/Hanul/UPPERCASE.JS/blob/master/DOC/UPPERCASE.JS-COMMON.md)과 [NODE](https://github.com/Hanul/UPPERCASE.JS/blob/master/DOC/UPPERCASE.JS-NODE.md)를 사용할 수 있습니다.

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

## 코드 예제
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

## 내장 함수
### print
`print`를 사용하여 `HTML` 문서에 내용을 추가합니다.
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
결과
```html

<!DOCTYPE html>
<html>
	<body>
		<h1>My first NSP page</h1>
		Hello World!
	</body>
</html>
```

JSON 객체도 출력할 수 있습니다. 이를 통해 JSON 기반 API를 만들 수 있습니다.
```nsp
<%
	var data = {
		a : 1,
		b : 2,
		c : 3
	};
	
	print(data);
%>
```
결과
```json
{"a":1,"b":2,"c":3}
```

### pause/resume
데이터베이스 등을 조작하다 `callback` 처리로 들어갈 경우 `pause` 함수로 문서 해석을 잠시 중단할 수 있습니다. `resume` 함수로 문서 해석을 다시 진행할 수 있습니다.
```nsp
start
<%
	setTimeout(function() {
	
		print('ok');
		
		resume();
	}, 1000);
	
	pause();
%>
end
```

## 기타
### PHP에 익숙한 개발자세요?
[php.js](https://github.com/kvz/phpjs)를 설치하여 NSP와 함께 사용해보세요.
```nsp
<!DOCTYPE html>
<html>
	<body>
		<h1>NSP + php.js</h1>
		<%
			var php = require('phpjs');
			
			print(php.sprintf('Hey, %s : )', 'you'));
			print(php.parse_url('mysql://kevin:abcd1234@example.com/databasename')['pass']);
			print(php.strtotime('2 januari 2012, 11:12:13 GMT'));
		%>
	</body>
</html>
```

## 라이센스
[MIT](../../LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)