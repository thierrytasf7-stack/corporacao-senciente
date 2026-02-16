#!/usr/bin/env python3
"""
Script para testar as correções implementadas na aplicação
Verifica se os problemas identificados nos logs foram resolvidos
"""

import json
import time
import requests
from datetime import datetime

class FixTester:
    def __init__(self):
        self.frontend_url = "http://localhost:13000"
        self.backend_url = "http://localhost:13001"
        self.test_results = []
        
    def test_api_endpoints(self):
        """Testa os endpoints da API que estavam com erro"""
        print("🔍 Testando endpoints da API...")
        
        endpoints = [
            "/api/v1/binance/test-connection",
            "/api/v1/binance/portfolio", 
            "/api/v1/binance/balances",
            "/api/v1/binance/positions"
        ]
        
        for endpoint in endpoints:
            try:
                url = f"{self.backend_url}{endpoint}"
                response = requests.get(url, timeout=5)
                
                result = {
                    "endpoint": endpoint,
                    "status_code": response.status_code,
                    "success": response.status_code < 400,
                    "error": None
                }
                
                if response.status_code >= 400:
                    result["error"] = f"HTTP {response.status_code}"
                    
                self.test_results.append(result)
                print(f"  ✅ {endpoint}: {response.status_code}")
                
            except requests.exceptions.ConnectionError:
                result = {
                    "endpoint": endpoint,
                    "status_code": None,
                    "success": False,
                    "error": "Connection refused"
                }
                self.test_results.append(result)
                print(f"  ❌ {endpoint}: Connection refused")
                
            except Exception as e:
                result = {
                    "endpoint": endpoint,
                    "status_code": None,
                    "success": False,
                    "error": str(e)
                }
                self.test_results.append(result)
                print(f"  ❌ {endpoint}: {str(e)}")
    
    def test_frontend_connection(self):
        """Testa se o frontend está acessível"""
        print("🌐 Testando conexão com frontend...")
        
        try:
            response = requests.get(self.frontend_url, timeout=5)
            result = {
                "test": "frontend_connection",
                "status_code": response.status_code,
                "success": response.status_code == 200,
                "error": None
            }
            
            if response.status_code == 200:
                print(f"  ✅ Frontend acessível: {response.status_code}")
            else:
                result["error"] = f"HTTP {response.status_code}"
                print(f"  ⚠️ Frontend retornou: {response.status_code}")
                
            self.test_results.append(result)
            
        except Exception as e:
            result = {
                "test": "frontend_connection",
                "status_code": None,
                "success": False,
                "error": str(e)
            }
            self.test_results.append(result)
            print(f"  ❌ Frontend não acessível: {str(e)}")
    
    def test_backend_connection(self):
        """Testa se o backend está acessível"""
        print("🔧 Testando conexão com backend...")
        
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            result = {
                "test": "backend_connection",
                "status_code": response.status_code,
                "success": response.status_code == 200,
                "error": None
            }
            
            if response.status_code == 200:
                print(f"  ✅ Backend acessível: {response.status_code}")
            else:
                result["error"] = f"HTTP {response.status_code}"
                print(f"  ⚠️ Backend retornou: {response.status_code}")
                
            self.test_results.append(result)
            
        except Exception as e:
            result = {
                "test": "backend_connection",
                "status_code": None,
                "success": False,
                "error": str(e)
            }
            self.test_results.append(result)
            print(f"  ❌ Backend não acessível: {str(e)}")
    
    def generate_report(self):
        """Gera relatório dos testes"""
        print("\n📊 RELATÓRIO DE TESTES")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - successful_tests
        
        print(f"Total de testes: {total_tests}")
        print(f"✅ Sucessos: {successful_tests}")
        print(f"❌ Falhas: {failed_tests}")
        print(f"📈 Taxa de sucesso: {(successful_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ TESTES QUE FALHARAM:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result.get('endpoint', result.get('test', 'Unknown'))}: {result['error']}")
        
        # Salvar relatório
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "failed_tests": failed_tests,
                "success_rate": (successful_tests/total_tests)*100
            },
            "results": self.test_results
        }
        
        with open("test_fixes_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=4, ensure_ascii=False)
        
        print(f"\n📄 Relatório salvo em: test_fixes_report.json")
        
        return successful_tests == total_tests
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 INICIANDO TESTES DAS CORREÇÕES")
        print("=" * 50)
        
        self.test_frontend_connection()
        self.test_backend_connection()
        self.test_api_endpoints()
        
        success = self.generate_report()
        
        if success:
            print("\n🎉 TODOS OS TESTES PASSARAM!")
            print("✅ As correções foram aplicadas com sucesso")
        else:
            print("\n⚠️ ALGUNS TESTES FALHARAM")
            print("🔧 Verifique os problemas identificados")
        
        return success

def main():
    """Função principal"""
    tester = FixTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ SISTEMA PRONTO PARA USO!")
    else:
        print("\n❌ SISTEMA PRECISA DE AJUSTES ADICIONAIS")

if __name__ == "__main__":
    main()
