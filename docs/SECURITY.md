# AZ-OS v2.0 - Security Considerations

## Overview

AZ-OS v2.0 implements comprehensive security measures to protect data, prevent unauthorized access, and ensure compliance with industry standards.

## Security Architecture

### Authentication & Authorization

#### API Key Management
- **Generation**: Cryptographically secure random keys
- **Storage**: Encrypted at rest using AES-256
- **Rotation**: Automatic rotation every 30 days
- **Revocation**: Immediate revocation on security events

#### JWT Token System
- **Algorithm**: RS256 (RSA with SHA-256)
- **Expiration**: Configurable (default: 1 hour)
- **Refresh**: Secure refresh token mechanism
- **Claims**: Standard claims with custom permissions

#### Role-Based Access Control (RBAC)
```python
# Permission levels
PERMISSIONS = {
    'admin': ['*', '!delete_system'],
    'manager': ['read:*', 'write:*', 'delete:own'],
    'user': ['read:*', 'write:own'],
    'viewer': ['read:*']
}
```

### Data Protection

#### Encryption
- **At Rest**: AES-256-GCM for all sensitive data
- **In Transit**: TLS 1.3 with perfect forward secrecy
- **Key Management**: AWS KMS integration (optional)
- **Key Rotation**: Automatic key rotation every 90 days

#### Data Classification
```python
# Data sensitivity levels
SENSITIVITY_LEVELS = {
    'public': [],
    'internal': ['encrypt_at_rest'],
    'confidential': ['encrypt_at_rest', 'encrypt_in_transit'],
    'restricted': ['encrypt_at_rest', 'encrypt_in_transit', 'audit_log']
}
```

### Input Validation & Sanitization

#### Validation Rules
```python
# Input validation patterns
VALIDATION_RULES = {
    'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    'password': r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
    'api_key': r'^[A-Za-z0-9]{32,64}$',
    'uuid': r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
}
```

#### Sanitization Functions
```python
def sanitize_input(data: dict) -> dict:
    """Sanitize all user inputs"""
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            # Remove potential XSS vectors
            value = re.sub(r'<script.*?>.*?</script>', '', value, flags=re.IGNORECASE)
            # Escape HTML entities
            value = html.escape(value)
        sanitized[key] = value
    return sanitized

def validate_sql_input(query: str) -> bool:
    """Prevent SQL injection"""
    # Check for dangerous patterns
    dangerous_patterns = [
        r'\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\b',
        r'\b(UNION|JOIN|WHERE|ORDER BY|GROUP BY)\b',
        r'\b(EXEC|EXECUTE|sp_\w+)\b'
    ]
    for pattern in dangerous_patterns:
        if re.search(pattern, query, re.IGNORECASE):
            return False
    return True
```

### Rate Limiting

#### Configuration
```python
# Rate limiting settings
RATE_LIMIT_CONFIG = {
    'default': {'limit': 100, 'window': 60},  # 100 req/min
    'admin': {'limit': 1000, 'window': 60},   # 1000 req/min
    'api': {'limit': 500, 'window': 60},      # 500 req/min
    'login': {'limit': 5, 'window': 300},     # 5 req/5min
    'password_reset': {'limit': 3, 'window': 3600}  # 3 req/hour
}
```

#### Implementation
```python
class RateLimiter:
    def __init__(self):
        self.redis_client = redis.Redis(host='redis', port=6379)
    
    def check_limit(self, user_id: str, endpoint: str) -> bool:
        """Check if user has exceeded rate limit"""
        key = f"rate_limit:{user_id}:{endpoint}"
        current = self.redis_client.incr(key)
        
        if current == 1:
            # First request, set expiration
            self.redis_client.expire(key, RATE_LIMIT_CONFIG['default']['window'])
        
        return current <= RATE_LIMIT_CONFIG['default']['limit']
```

### CORS Protection

#### Configuration
```python
# CORS settings
CORS_CONFIG = {
    'allowed_origins': [
        'https://app.az-os.com',
        'https://api.az-os.com',
        'https://localhost:3000',
        'https://localhost:8080'
    ],
    'allowed_methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allowed_headers': ['Content-Type', 'Authorization', 'X-API-Key'],
    'expose_headers': ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    'max_age': 86400  # 24 hours
}
```

### Audit Logging

#### Security Events
```python
# Security event types
SECURITY_EVENTS = {
    'login_success': 'User login successful',
    'login_failure': 'User login failed',
    'api_key_generated': 'API key generated',
    'api_key_revoked': 'API key revoked',
    'data_access': 'Data accessed',
    'data_modified': 'Data modified',
    'security_breach_attempt': 'Security breach attempt detected',
    'rate_limit_exceeded': 'Rate limit exceeded',
    'unauthorized_access': 'Unauthorized access attempt'
}
```

#### Audit Logger
```python
class AuditLogger:
    def __init__(self):
        self.logger = logging.getLogger('security_audit')
        self.logger.setLevel(logging.INFO)
        handler = logging.handlers.RotatingFileHandler(
            'logs/security_audit.log',
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        formatter = logging.Formatter(
            '%(asctime)s - %(user_id)s - %(event)s - %(details)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log_event(self, user_id: str, event: str, details: dict = None):
        """Log security event"""
        log_data = {
            'user_id': user_id,
            'event': event,
            'details': details or {}
        }
        self.logger.info('', extra=log_data)
```

## Vulnerability Prevention

### SQL Injection Prevention

#### Parameterized Queries
```python
# Safe query execution
async def execute_query(query: str, params: tuple):
    """Execute parameterized query"""
    async with database.get_connection() as conn:
        async with conn.transaction():
            result = await conn.execute(query, params)
            return result

# Example usage
query = "SELECT * FROM users WHERE email = $1 AND status = $2"
params = (user_email, 'active')
user = await execute_query(query, params)
```

#### ORM Usage
```python
# SQLAlchemy ORM example
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    status = Column(String, default='active')

# Safe data access
user = await session.query(User).filter(
    User.email == user_email,
    User.status == 'active'
).first()
```

### XSS Prevention

#### Content Security Policy
```python
# CSP headers
CSP_HEADER = """
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
    img-src 'self' data: https://images.unsplash.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.az-os.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
"""
```

#### Input Sanitization
```python
def sanitize_html_input(input_html: str) -> str:
    """Sanitize HTML input to prevent XSS"""
    # Remove dangerous tags
    cleaner = bleach.Cleaner(
        tags=['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
        attributes={'a': ['href', 'title']},
        strip=True
    )
    return cleaner.clean(input_html)
```

### CSRF Protection

#### Token Generation
```python
class CSRFTokenManager:
    def __init__(self):
        self.redis_client = redis.Redis(host='redis', port=6379)
    
    def generate_token(self, user_id: str) -> str:
        """Generate CSRF token"""
        token = secrets.token_urlsafe(32)
        self.redis_client.setex(
            f"csrf:{user_id}",
            3600,  # 1 hour
            token
        )
        return token
    
    def validate_token(self, user_id: str, token: str) -> bool:
        """Validate CSRF token"""
        stored_token = self.redis_client.get(f"csrf:{user_id}")
        return stored_token == token
```

### File Upload Security

#### Validation Rules
```python
# File upload security
UPLOAD_SECURITY = {
    'max_size': 10 * 1024 * 1024,  # 10MB
    'allowed_types': [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf', 'text/plain', 'application/json'
    ],
    'virus_scan': True,
    'scan_service': 'clamav'
}
```

#### Secure Upload Handler
```python
class SecureFileUploader:
    def __init__(self):
        self.allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.json']
    
    def validate_file(self, file: FileStorage) -> bool:
        """Validate uploaded file"""
        # Check file size
        if file.content_length > UPLOAD_SECURITY['max_size']:
            return False
        
        # Check file type
        if file.content_type not in UPLOAD_SECURITY['allowed_types']:
            return False
        
        # Check file extension
        filename = file.filename.lower()
        if not any(filename.endswith(ext) for ext in self.allowed_extensions):
            return False
        
        # Scan for viruses (if enabled)
        if UPLOAD_SECURITY['virus_scan']:
            if not self.virus_scan(file):
                return False
        
        return True
    
    def virus_scan(self, file: FileStorage) -> bool:
        """Scan file for viruses"""
        # Connect to virus scanning service
        response = requests.post(
            f"{UPLOAD_SECURITY['scan_service']}/scan",
            files={'file': file}
        )
        return response.json().get('status') == 'clean'
```

## Compliance

### GDPR Compliance

#### Data Processing
```python
class GDPRProcessor:
    def __init__(self):
        self.data_retention = 365  # Days
        self.consent_required = ['email', 'phone', 'address']
    
    def process_personal_data(self, data: dict, user_id: str) -> dict:
        """Process personal data with GDPR compliance"""
        # Check for required consent
        for field in self.consent_required:
            if field in data and not self.has_consent(user_id, field):
                raise PermissionError(f"Consent required for {field}")
        
        # Anonymize data after retention period
        if self.is_retention_expired(user_id):
            return self.anonymize_data(data)
        
        return data
    
    def delete_user_data(self, user_id: str):
        """Delete all user data (right to be forgotten)"""
        # Delete from main tables
        await session.execute("DELETE FROM users WHERE id = :id", {'id': user_id})
        await session.execute("DELETE FROM user_data WHERE user_id = :id", {'id': user_id})
        
        # Delete from audit logs (after retention period)
        await session.execute("
            DELETE FROM audit_logs 
            WHERE user_id = :id AND created_at < NOW() - INTERVAL '1 year'
        ", {'id': user_id})
```

### SOC 2 Compliance

#### Security Controls
```python
# SOC 2 security controls
SOC2_CONTROLS = {
    'CC1': 'Access controls are properly managed',
    'CC2': 'Data is classified and protected accordingly',
    'CC3': 'System infrastructure is secured',
    'CC4': 'Data is encrypted in transit and at rest',
    'CC5': 'Network security is maintained',
    'CC6': 'Change management is controlled',
    'CC7': 'Incident response procedures are in place'
}
```

### ISO 27001 Compliance

#### Information Security Management
```python
class ISO27001Manager:
    def __init__(self):
        self.risk_assessment = self.perform_risk_assessment()
        self.security_policies = self.load_security_policies()
        self.audit_schedule = self.create_audit_schedule()
    
    def perform_risk_assessment(self) -> dict:
        """Perform regular risk assessments"""
        return {
            'threats': ['data breach', 'ransomware', 'insider threat'],
            'vulnerabilities': ['unpatched systems', 'weak passwords', 'social engineering'],
            'impact': ['financial loss', 'reputational damage', 'regulatory fines'],
            'likelihood': ['high', 'medium', 'low']
        }
    
    def load_security_policies(self) -> dict:
        """Load security policies"""
        return {
            'access_control': 'Policy for managing user access',
            'data_protection': 'Policy for protecting sensitive data',
            'incident_response': 'Policy for handling security incidents',
            'change_management': 'Policy for managing system changes'
        }
```

## Monitoring & Alerting

### Security Monitoring

#### Real-time Monitoring
```python
class SecurityMonitor:
    def __init__(self):
        self.alert_thresholds = {
            'failed_logins': 5,
            'rate_limit_exceeded': 10,
            'unauthorized_access': 3,
            'data_access_anomaly': 100
        }
        self.alert_channels = ['email', 'slack', 'pagerduty']
    
    def monitor_security_events(self):
        """Monitor security events in real-time"""
        while True:
            events = self.get_security_events()
            for event in events:
                if self.should_alert(event):
                    self.send_alert(event)
            time.sleep(60)  # Check every minute
    
    def should_alert(self, event: dict) -> bool:
        """Determine if event should trigger alert"""
        event_type = event.get('type')
        count = event.get('count', 1)
        
        if event_type in self.alert_thresholds:
            return count >= self.alert_thresholds[event_type]
        
        return False
```

#### Alert Configuration
```python
# Security alert configuration
ALERT_CONFIG = {
    'critical': {
        'threshold': 1,
        'channels': ['email', 'sms', 'pagerduty'],
        'response_time': '5 minutes'
    },
    'high': {
        'threshold': 5,
        'channels': ['email', 'slack'],
        'response_time': '30 minutes'
    },
    'medium': {
        'threshold': 10,
        'channels': ['email'],
        'response_time': '2 hours'
    }
}
```

### Incident Response

#### Response Plan
```python
class IncidentResponse:
    def __init__(self):
        self.response_team = ['security@az-os.com', 'devops@az-os.com']
        self.communication_plan = self.create_communication_plan()
        self.remediation_steps = self.define_remediation_steps()
    
    def create_communication_plan(self) -> dict:
        """Create incident communication plan"""
        return {
            'internal': ['security@az-os.com', 'devops@az-os.com', 'management@az-os.com'],
            'external': ['customers@az-os.com', 'legal@az-os.com'],
            'timeline': {
                '0-15min': 'Assess and contain',
                '15-60min': 'Investigate and notify',
                '1-4hrs': 'Remediate and document',
                '4+hrs': 'Review and improve'
            }
        }
    
    def define_remediation_steps(self) -> list:
        """Define incident remediation steps"""
        return [
            'Isolate affected systems',
            'Preserve evidence for forensic analysis',
            'Patch vulnerabilities',
            'Reset compromised credentials',
            'Notify affected parties',
            'Conduct post-incident review'
        ]
```

## Security Testing

### Regular Testing

#### Penetration Testing
```python
class PenetrationTester:
    def __init__(self):
        self.testing_schedule = 'quarterly'
        self.scope = ['web_app', 'api', 'infrastructure']
        self.authorized_testers = ['external_security_firm', 'internal_red_team']
    
    def conduct_pentest(self):
        """Conduct penetration testing"""
        # External penetration test
        external_results = self.external_pentest()
        
        # Internal red team exercise
        internal_results = self.internal_red_team()
        
        # Compile results and create remediation plan
        return self.analyze_results(external_results, internal_results)
```

#### Vulnerability Scanning
```python
class VulnerabilityScanner:
    def __init__(self):
        self.scan_schedule = 'weekly'
        self.scan_tools = ['nmap', 'nessus', 'openvas']
        self.severity_threshold = 'medium'
    
    def run_vulnerability_scan(self):
        """Run vulnerability scans"""
        # Network scan
        network_vulns = self.scan_network()
        
        # Application scan
        app_vulns = self.scan_applications()
        
        # Infrastructure scan
        infra_vulns = self.scan_infrastructure()
        
        # Filter by severity
        critical_vulns = self.filter_by_severity(
            network_vulns + app_vulns + infra_vulns,
            'critical'
        )
        
        return critical_vulns
```

### Security Headers

#### HTTP Security Headers
```python
# Security headers configuration
SECURITY_HEADERS = {
    'Content-Security-Policy': CSP_HEADER,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
}
```

## Training & Awareness

### Security Training

#### Employee Training
```python
class SecurityTraining:
    def __init__(self):
        self.training_schedule = 'quarterly'
        self.topics = [
            'password security',
            'phishing awareness',
            'data protection',
            'incident reporting',
            'physical security'
        ]
        self.compliance_requirements = ['GDPR', 'SOC 2', 'ISO 27001']
    
    def conduct_training(self):
        """Conduct security training sessions"""
        for topic in self.topics:
            self.deliver_training_module(topic)
        
        # Assess knowledge
        self.assess_knowledge()
        
        # Document completion
        self.document_training()
```

#### Phishing Simulations
```python
class PhishingSimulator:
    def __init__(self):
        self.simulation_schedule = 'monthly'
        self.phishing_templates = [
            'fake_password_reset',
            'fake_invoice',
            'fake_urgent_message'
        ]
        self.success_metrics = ['click_rate', 'report_rate']
    
    def run_simulation(self):
        """Run phishing simulation"""
        # Select random template
        template = random.choice(self.phishing_templates)
        
        # Send simulated phishing email
        self.send_phishing_email(template)
        
        # Track results
        results = self.track_simulation_results()
        
        # Provide feedback
        self.provide_feedback(results)
```

## Documentation

### Security Documentation

#### Security Policies
```python
# Security policy documentation
SECURITY_POLICIES = {
    'access_control': {
        'purpose': 'Define how access to systems and data is controlled',
        'scope': 'All employees and contractors',
        'responsibilities': {
            'IT': 'Implement and maintain access controls',
            'HR': 'Manage user access during onboarding/offboarding',
            'Employees': 'Follow access control procedures'
        }
    },
    'data_protection': {
        'purpose': 'Ensure sensitive data is protected',
        'scope': 'All data processed by AZ-OS',
        'responsibilities': {
            'Security': 'Define data classification and protection',
            'Development': 'Implement data protection measures',
            'All Employees': 'Handle data according to classification'
        }
    }
}
```

#### Incident Response Plan
```python
# Incident response documentation
INCIDENT_RESPONSE_PLAN = {
    'purpose': 'Provide guidance for handling security incidents',
    'scope': 'All security incidents affecting AZ-OS',
    'roles': {
        'Incident Manager': 'Coordinate incident response',
        'Technical Lead': 'Technical investigation and remediation',
        'Communications Lead': 'Internal and external communications',
        'Legal Counsel': 'Legal and regulatory compliance'
    },
    'procedures': {
        'detection': 'Monitor and detect security incidents',
        'assessment': 'Assess impact and severity',
        'containment': 'Contain the incident',
        'eradication': 'Remove threat from systems',
        'recovery': 'Restore systems to normal operation',
        'lessons_learned': 'Review and improve incident response'
    }
}
```

## Third-Party Security

### Vendor Assessment

#### Vendor Security Requirements
```python
class VendorSecurity:
    def __init__(self):
        self.assessment_criteria = {
            'data_security': 'How vendor protects data',
            'access_controls': 'Vendor access management',
            'compliance': 'Relevant certifications and compliance',
            'incident_response': 'Vendor's incident response capabilities',
            'business_continuity': 'Vendor's disaster recovery plans'
        }
        self.risk_tolerance = 'medium'
    
    def assess_vendor(self, vendor: dict) -> dict:
        """Assess vendor security posture"""
        assessment = {}
        
        for criterion, description in self.assessment_criteria.items():
            score = self.evaluate_criterion(vendor, criterion)
            assessment[criterion] = {
                'description': description,
                'score': score,
                'comments': self.get_comments(vendor, criterion)
            }
        
        # Calculate overall risk
        overall_risk = self.calculate_overall_risk(assessment)
        
        return {
            'assessment': assessment,
            'overall_risk': overall_risk,
            'recommendations': self.get_recommendations(overall_risk)
        }
```

#### Data Processing Agreements
```python
class DataProcessingAgreement:
    def __init__(self):
        self.required_clauses = [
            'data_confidentiality',
            'data_processing_scope',
            'data_security_standards',
            'data_retention_and_deletion',
            'subprocessor_approval',
            'audit_rights',
            'breach_notification'
        ]
        self.governing_law = 'Delaware, USA'
    
    def create_dpa(self, vendor: dict) -> str:
        """Create Data Processing Agreement"""
        dpa_content = f"""DATA PROCESSING AGREEMENT

This Data Processing Agreement ("DPA") is entered into as of {datetime.now().date()} by and between AZ-OS and {vendor['name']}.

1. Data Processing Scope
   {vendor['name']} shall process personal data solely for the purposes of {vendor['purpose']}.

2. Data Security
   {vendor['name']} shall implement and maintain appropriate technical and organizational measures to protect personal data.

3. Data Retention
   Personal data shall be retained for no longer than {vendor['retention_period']} unless required by law.

4. Subprocessors
   {vendor['name']} shall not engage any subprocessors without prior written consent from AZ-OS.

5. Audit Rights
   AZ-OS shall have the right to audit {vendor['name']}'s compliance with this DPA.

6. Breach Notification
   {vendor['name']} shall notify AZ-OS within {vendor['notification_period']} of any data breach.

This DPA is governed by the laws of {self.governing_law}.
"""
        return dpa_content
```

## Continuous Improvement

### Security Metrics

#### Key Performance Indicators
```python
# Security KPIs
SECURITY_KPIS = {
    'mean_time_to_detect': 'Average time to detect security incidents',
    'mean_time_to_respond': 'Average time to respond to security incidents',
    'vulnerability_discovery_rate': 'Number of vulnerabilities discovered per month',
    'security_incident_rate': 'Number of security incidents per month',
    'employee_training_completion': 'Percentage of employees completing security training',
    'third_party_assessment_pass_rate': 'Percentage of vendors passing security assessments'
}
```

#### Security Dashboard
```python
class SecurityDashboard:
    def __init__(self):
        self.metrics = self.collect_security_metrics()
        self.alerts = self.get_security_alerts()
        self.trends = self.analyze_security_trends()
    
    def collect_security_metrics(self) -> dict:
        """Collect security metrics"""
        return {
            'mttd': self.calculate_mttd(),
            'mttr': self.calculate_mttr(),
            'vuln_discovery': self.count_vulnerabilities(),
            'incident_rate': self.count_incidents(),
            'training_completion': self.calculate_training_completion()
        }
    
    def display_dashboard(self):
        """Display security dashboard"""
        print("=== AZ-OS Security Dashboard ===")
        print(f"Mean Time to Detect: {self.metrics['mttd']} minutes")
        print(f"Mean Time to Respond: {self.metrics['mttr']} minutes")
        print(f"Vulnerabilities Discovered: {self.metrics['vuln_discovery']} this month")
        print(f"Security Incidents: {self.metrics['incident_rate']} this month")
        print(f"Training Completion: {self.metrics['training_completion']}%")
        
        if self.alerts:
            print("\n=== Active Security Alerts ===")
            for alert in self.alerts:
                print(f"{alert['severity']}: {alert['message']}")
        
        if self.trends:
            print("\n=== Security Trends ===")
            for trend, data in self.trends.items():
                print(f"{trend}: {data['direction']} ({data['percentage']}%)")
```

### Security Reviews

#### Regular Security Reviews
```python
class SecurityReview:
    def __init__(self):
        self.review_schedule = 'quarterly'
        self.review_areas = [
            'access_controls',
            'data_protection',
            'network_security',
            'application_security',
            'physical_security',
            'compliance'
        ]
        self.review_team = ['security@az-os.com', 'devops@az-os.com', 'legal@az-os.com']
    
    def conduct_review(self):
        """Conduct comprehensive security review"""
        review_results = {}
        
        for area in self.review_areas:
            results = self.review_area(area)
            review_results[area] = results
        
        # Generate overall assessment
        overall_assessment = self.generate_overall_assessment(review_results)
        
        # Create improvement plan
        improvement_plan = self.create_improvement_plan(review_results)
        
        return {
            'review_results': review_results,
            'overall_assessment': overall_assessment,
            'improvement_plan': improvement_plan
        }
```

## Conclusion

This security documentation provides a comprehensive overview of AZ-OS v2.0's security posture. Regular reviews and updates are essential to maintain and improve security as threats evolve and new vulnerabilities are discovered.

**Last Updated**: 2024-01-15
**Next Review**: 2024-04-15
**Version**: 2.0.0