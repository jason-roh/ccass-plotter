import requests
from abc import ABC, abstractmethod
from concurrent.futures import ThreadPoolExecutor, as_completed

class WebRequest(ABC):
    def __init__(self):
        self.url_list = ['http://www.naver.com', 'http://www.daum.net', 'http://www.yahoo.com', 
            'http://www.naver.com', 'http://www.daum.net', 'http://www.yahoo.com',
            'http://www.naver.com', 'http://www.daum.net', 'http://www.yahoo.com',
            'http://www.naver.com', 'http://www.daum.net', 'http://www.yahoo.com',
            'http://www.naver.com', 'http://www.daum.net', 'http://www.yahoo.com']
        
        self.web_request = []
        self.message = "---------Finished---------"

    @abstractmethod
    def run(self):
        pass


class WebRequestSingle(WebRequest):
    def __init__(self):
        super(WebRequestSingle, self).__init__()

    def run(self):
        for url in self.url_list:
            html = requests.get(url, stream=True)
            self.web_request.append(html.text)
            print(self.message)
    
        return len(self.web_request)

class WebRequestMulti(WebRequest):
    def __init__(self):
        super(WebRequestMulti, self).__init__()
        self.stream = True

    def _process_result(self, url, message):
        try:
            html = requests.get(url, stream=self.stream)
            self.web_request.append(html.text)
            return message
        except requests.exceptions.RequestException as e:
            return e

    def run(self):
        threads = []
        with ThreadPoolExecutor(max_workers=20) as executor:
            for url in self.url_list:
                threads.append(executor.submit(self._process_result, url, self.message))
            
            for task in as_completed(threads):
                print(task.result()) 

            return len(self.web_request)
