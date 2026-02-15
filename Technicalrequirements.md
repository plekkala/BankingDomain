RT2 Synchronisation Lab - Technical Architecture & Specification
Executive Summary
This document outlines a comprehensive cloud-native, microservices-based architecture for the RT2 Synchronisation Lab, leveraging event-driven patterns and distributed ledger technology to enable atomic settlement demonstrations across multiple synchronisation operators.

1. Architecture Overview
1.1 High-Level Architecture

┌─────────────────────────────────────────────────────────────────────┐
│                     Synchronisation Lab Platform                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              API Gateway & Service Mesh Layer               │    │
│  │  (Kong/Apigee + Istio for authentication, rate limiting)   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │
│  │ Participant  │  │  RT2 Core    │  │   Event Bus          │     │
│  │ Management   │  │  Services    │  │   (Kafka/EventBridge)│     │
│  └──────────────┘  └──────────────┘  └──────────────────────┘     │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            Settlement Engine (Microservices)                  │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐   │  │
│  │  │ Earmarking  │ │ Settlement   │ │ Transaction        │   │  │
│  │  │ Service     │ │ Execution    │ │ Orchestration      │   │  │
│  │  └─────────────┘ └──────────────┘ └────────────────────┘   │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐   │  │
│  │  │ Liquidity   │ │ Validation   │ │ Reconciliation     │   │  │
│  │  │ Management  │ │ Service      │ │ Service            │   │  │
│  │  └─────────────┘ └──────────────┘ └────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │        Distributed Ledger Layer (Hyperledger Fabric/         │  │
│  │        Corda/Quorum for immutable audit trail)               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │
│  │ Monitoring & │  │ Analytics    │  │ Security &           │     │
│  │ Observability│  │ & Reporting  │  │ Compliance           │     │
│  └──────────────┘  └──────────────┘  └──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Secure API Connections
                              ▼
    ┌───────────────────────────────────────────────────────┐
    │        Lab Participants (Synchronisation Operators)    │
    ├───────────────────────────────────────────────────────┤
    │ Transpact │ Swift │ LSEG │ Chainlink │ ... (18 total) │
    └───────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌───────────────────────────────────────────────────────┐
    │         External Systems (Simulated/Real)             │
    ├───────────────────────────────────────────────────────┤
    │ Asset Ledgers │ RTGS Accounts │ Payment Systems      │
    └───────────────────────────────────────────────────────┘


2. Technology Stack
2.1 Cloud Platform
	∙	Primary: AWS (with multi-cloud readiness via Kubernetes)
	∙	Alternative: Azure or GCP for redundancy
	∙	Regions: UK-based (London) with DR in secondary UK region
2.2 Core Technologies



|Component              |Technology                                 |Justification                                     |
|-----------------------|-------------------------------------------|--------------------------------------------------|
|Container Orchestration|Kubernetes (EKS)                           |Industry standard, scalability, portability       |
|Service Mesh           |Istio                                      |Traffic management, security, observability       |
|API Gateway            |Kong Enterprise / AWS API Gateway          |Rate limiting, authentication, analytics          |
|Event Streaming        |Apache Kafka / AWS MSK                     |High throughput, event sourcing, replay capability|
|Distributed Ledger     |Hyperledger Fabric / R3 Corda              |Permissioned, privacy, smart contracts            |
|Databases              |PostgreSQL (RDS), DynamoDB, Redis          |ACID compliance, scalability, caching             |
|Message Queue          |RabbitMQ / AWS SQS                         |Reliable message delivery                         |
|Service Discovery      |Consul / AWS Cloud Map                     |Dynamic service registration                      |
|Monitoring             |Prometheus + Grafana                       |Metrics, alerting, visualization                  |
|Logging                |ELK Stack (Elasticsearch, Logstash, Kibana)|Centralized logging, search                       |
|Tracing                |Jaeger / AWS X-Ray                         |Distributed tracing                               |
|CI/CD                  |GitLab CI / GitHub Actions + ArgoCD        |Automated deployment, GitOps                      |

3. Microservices Architecture
3.1 Core Services
3.1.1 Settlement Engine Services
1. Transaction Orchestration Service

Responsibility: Manages end-to-end transaction lifecycle
Technology: Node.js/Java Spring Boot
API: REST + gRPC
Events Published:
  - TransactionInitiated
  - TransactionCompleted
  - TransactionFailed
  - TransactionCancelled
Data Store: PostgreSQL + Event Store


2. Earmarking Service

Responsibility: Handles fund reservation and release
Technology: Java Spring Boot
API: REST + Event-driven
Events:
  - FundsEarmarked
  - FundsReleased
  - EarmarkingRequested
  - EarmarkingExpired
Data Store: PostgreSQL with optimistic locking
State Machine: FSM for earmark lifecycle


3. Settlement Execution Service

Responsibility: Final settlement processing
Technology: Java/Golang for performance
API: gRPC for low latency
Events:
  - SettlementInstructionReceived
  - SettlementExecuted
  - SettlementRejected
Data Store: PostgreSQL + DLT for immutability
Idempotency: Required for all operations


4. Liquidity Management Service

Responsibility: Real-time liquidity monitoring and optimization
Technology: Golang
API: REST + WebSocket for real-time updates
Features:
  - Real-time balance tracking
  - Liquidity forecasting
  - Queue management
Data Store: Redis (cache) + PostgreSQL (persistence)


5. Validation Service

Responsibility: Transaction validation and compliance checks
Technology: Java Spring Boot
API: Synchronous gRPC
Validations:
  - Account status
  - Sufficient funds
  - Business rules
  - Regulatory compliance
Data Store: PostgreSQL + Rules Engine (Drools)


6. Reconciliation Service

Responsibility: End-of-day and real-time reconciliation
Technology: Python/Java
API: REST + Batch processing
Features:
  - Real-time transaction matching
  - Exception handling
  - Reporting
Data Store: PostgreSQL + Data Warehouse


3.1.2 Supporting Services
7. Participant Management Service

Responsibility: Manage Lab participants, credentials, permissions
Technology: Node.js + OAuth2/OIDC
API: REST
Features:
  - Onboarding
  - API key management
  - Permission management
  - Usage tracking
Data Store: PostgreSQL + Vault for secrets


8. Model Configuration Service

Responsibility: Configure and switch between synchronisation models (1-4)
Technology: Node.js
API: REST
Features:
  - Model definition
  - Runtime switching
  - Rule engine
Data Store: PostgreSQL + Redis cache


9. Notification Service

Responsibility: Multi-channel notifications
Technology: Node.js
API: Event-driven
Channels:
  - Webhook
  - Email
  - SMS
  - In-app
Data Store: PostgreSQL + Message Queue


10. Analytics Service

Responsibility: Real-time and historical analytics
Technology: Python + Apache Spark
API: REST + GraphQL
Features:
  - Transaction metrics
  - Performance analytics
  - Use case insights
Data Store: TimescaleDB + Elasticsearch


4. Event-Driven Architecture
4.1 Event Backbone

┌──────────────────────────────────────────────────────────┐
│                    Apache Kafka Cluster                   │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Topic: transactions.initiated                            │
│  Topic: transactions.earmarked                            │
│  Topic: transactions.settled                              │
│  Topic: transactions.failed                               │
│  Topic: transactions.cancelled                            │
│  Topic: liquidity.updated                                 │
│  Topic: notifications.outbound                            │
│  Topic: audit.events                                      │
│  Topic: model.configuration.changed                       │
│                                                            │
└──────────────────────────────────────────────────────────┘


4.2 Event Schema (Cloud Events Standard)

{
  "specversion": "1.0",
  "type": "com.bankofengland.rt2.transaction.earmarked",
  "source": "/services/earmarking",
  "id": "A234-1234-1234",
  "time": "2026-03-15T10:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "transactionId": "TXN-2026-03-15-001",
    "participantId": "PART-SWIFT-001",
    "accountId": "ACC-123456",
    "amount": {
      "value": 1000000.00,
      "currency": "GBP"
    },
    "earmarkId": "EMK-001",
    "expiryTime": "2026-03-15T16:00:00Z",
    "model": "MODEL_1"
  },
  "metadata": {
    "correlationId": "CORR-123",
    "causationId": "CAUSE-456",
    "userId": "USR-789"
  }
}


4.3 Event Flow Patterns
Pattern 1: Choreography (Preferred for loosely coupled services)

Transaction Service → Event Bus → Multiple Consumers
(Asynchronous, eventual consistency)


Pattern 2: Orchestration (For complex workflows)

Orchestrator Service → Commands to Services → Events back
(Centralized control, stronger consistency)


5. Distributed Ledger Design
5.1 Technology Choice: Hyperledger Fabric
Rationale:
	∙	Permissioned network suitable for regulated financial services
	∙	Channel-based privacy for different participant groups
	∙	Modular architecture
	∙	Strong governance model
	∙	Enterprise support
5.2 Network Architecture

┌─────────────────────────────────────────────────────────┐
│              Hyperledger Fabric Network                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Organization 1: Bank of England (Orderer)               │
│  ├─── Peer Nodes (2) - Endorsing & Committing           │
│  └─── CA (Certificate Authority)                         │
│                                                           │
│  Organization 2-N: Lab Participants                      │
│  ├─── Peer Nodes (1-2 per participant)                   │
│  └─── Client Applications                                │
│                                                           │
│  Channels:                                                │
│  ├─── settlement-channel (all participants)              │
│  ├─── audit-channel (BoE + regulators)                   │
│  └─── participant-specific-channels (privacy)            │
│                                                           │
│  Smart Contracts (Chaincode):                            │
│  ├─── Settlement Contract                                │
│  ├─── Earmarking Contract                                │
│  ├─── Liquidity Contract                                 │
│  └─── Audit Contract                                     │
│                                                           │
└─────────────────────────────────────────────────────────┘


5.3 Smart Contracts (Chaincode)
Settlement Contract

// Pseudo-code
type SettlementContract struct {
    contractapi.Contract
}

func (sc *SettlementContract) EarmarkFunds(
    ctx contractapi.TransactionContextInterface,
    transactionId string,
    accountId string,
    amount float64,
    expiryTime time.Time) error {
    
    // Validate inputs
    // Check account balance
    // Create earmark record
    // Update ledger state
    // Emit event
    
    earmark := Earmark{
        ID: generateID(),
        TransactionID: transactionId,
        AccountID: accountId,
        Amount: amount,
        Status: "EARMARKED",
        CreatedAt: time.Now(),
        ExpiryTime: expiryTime,
    }
    
    return ctx.GetStub().PutState(earmark.ID, marshal(earmark))
}

func (sc *SettlementContract) SettleFunds(
    ctx contractapi.TransactionContextInterface,
    transactionId string) error {
    
    // Retrieve earmark
    // Validate not expired
    // Execute settlement
    // Update states
    // Emit settlement event
    
    return nil
}

func (sc *SettlementContract) ReleaseFunds(
    ctx contractapi.TransactionContextInterface,
    earmarkId string) error {
    
    // Release earmarked funds
    // Update account balance
    // Update earmark status
    
    return nil
}


5.4 DLT Data Model

{
  "Transaction": {
    "id": "TXN-UUID",
    "participantId": "PART-001",
    "type": "DVP|PVP|HOUSE_PURCHASE|FX",
    "status": "INITIATED|EARMARKED|SETTLED|FAILED|CANCELLED",
    "model": "MODEL_1|MODEL_2|MODEL_3|MODEL_4",
    "amount": {
      "value": 1000000.00,
      "currency": "GBP"
    },
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601",
    "hash": "SHA-256",
    "previousHash": "SHA-256"
  },
  "Earmark": {
    "id": "EMK-UUID",
    "transactionId": "TXN-UUID",
    "accountId": "ACC-123",
    "amount": 1000000.00,
    "status": "ACTIVE|EXPIRED|RELEASED|SETTLED",
    "expiryTime": "ISO-8601",
    "createdAt": "ISO-8601"
  },
  "Account": {
    "id": "ACC-UUID",
    "participantId": "PART-001",
    "balance": 10000000.00,
    "earmarkedBalance": 1000000.00,
    "availableBalance": 9000000.00,
    "currency": "GBP"
  }
}


6. API Specification
6.1 API Design Principles
	∙	RESTful for CRUD operations
	∙	gRPC for low-latency inter-service communication
	∙	WebSocket for real-time updates
	∙	GraphQL for complex queries (analytics)
	∙	Versioning: URI-based (v1, v2)
	∙	OpenAPI 3.0 specification
6.2 Core API Endpoints
Transaction API

POST /api/v1/transactions
  Summary: Initiate a new transaction
  Request:
    {
      "participantId": "PART-SWIFT-001",
      "model": "MODEL_1",
      "type": "PVP",
      "payerAccount": "ACC-123",
      "payeeAccount": "ACC-456",
      "amount": {
        "value": 1000000.00,
        "currency": "GBP"
      },
      "assetDetails": {
        "ledgerId": "ASSET-LEDGER-001",
        "assetId": "BOND-XYZ"
      },
      "metadata": {}
    }
  Response: 201 Created
    {
      "transactionId": "TXN-2026-03-15-001",
      "status": "INITIATED",
      "createdAt": "2026-03-15T10:30:00Z"
    }

GET /api/v1/transactions/{transactionId}
  Summary: Retrieve transaction details
  Response: 200 OK

PUT /api/v1/transactions/{transactionId}/cancel
  Summary: Cancel a transaction
  Response: 200 OK

POST /api/v1/transactions/{transactionId}/earmark
  Summary: Request fund earmarking (Model 1)
  Request:
    {
      "accountId": "ACC-123",
      "amount": 1000000.00,
      "expiryMinutes": 60
    }
  Response: 201 Created

POST /api/v1/transactions/{transactionId}/settle
  Summary: Instruct final settlement
  Response: 200 OK

GET /api/v1/transactions
  Summary: List transactions with filtering
  Query Params:
    - participantId
    - status
    - dateFrom, dateTo
    - model
  Response: 200 OK (paginated)


Account API

GET /api/v1/accounts/{accountId}
  Summary: Get account details and balances
  Response:
    {
      "accountId": "ACC-123",
      "balance": 10000000.00,
      "earmarkedBalance": 1000000.00,
      "availableBalance": 9000000.00,
      "currency": "GBP"
    }

GET /api/v1/accounts/{accountId}/movements
  Summary: Get account movements (ledger)
  Response: 200 OK (paginated list)


Liquidity API

GET /api/v1/liquidity/positions
  Summary: Get real-time liquidity positions
  Response: 200 OK

POST /api/v1/liquidity/forecast
  Summary: Request liquidity forecast
  Response: 200 OK


Webhook API

POST /api/v1/webhooks
  Summary: Register webhook endpoint
  Request:
    {
      "url": "https://participant.com/webhooks",
      "events": [
        "transaction.earmarked",
        "transaction.settled",
        "transaction.failed"
      ],
      "secret": "webhook-signing-secret"
    }
  Response: 201 Created

DELETE /api/v1/webhooks/{webhookId}
  Summary: Unregister webhook
  Response: 204 No Content


6.3 Real-Time API (WebSocket)

// Connection
wss://api.rt2lab.bankofengland.co.uk/v1/stream

// Authentication via JWT in connection header
Authorization: Bearer <JWT_TOKEN>

// Subscribe to events
{
  "action": "subscribe",
  "channels": [
    "transactions.updates",
    "liquidity.positions"
  ],
  "filters": {
    "participantId": "PART-SWIFT-001"
  }
}

// Receive events
{
  "channel": "transactions.updates",
  "event": "transaction.settled",
  "data": {
    "transactionId": "TXN-001",
    "status": "SETTLED",
    "timestamp": "2026-03-15T11:00:00Z"
  }
}


7. Synchronisation Models Implementation
7.1 Model 1: Operator-Controlled Earmarking & Settlement

Sequence:
1. Synchronisation Operator → API: POST /transactions (initiate)
2. Synchronisation Operator → API: POST /transactions/{id}/earmark
3. RT2 Settlement Engine → Earmarking Service: Earmark funds
4. Earmarking Service → DLT: Record earmark
5. Earmarking Service → Event Bus: FundsEarmarked event
6. Synchronisation Operator ← Webhook: Earmarking confirmation
7. [Operator performs external asset ledger operations]
8. Synchronisation Operator → API: POST /transactions/{id}/settle
9. Settlement Service → DLT: Execute settlement
10. Settlement Service → Event Bus: TransactionSettled event
11. Synchronisation Operator ← Webhook: Settlement confirmation


7.2 Model 2: RTGS Account Holder Earmarking

Sequence:
1. Synchronisation Operator → API: POST /transactions (initiate)
2. Synchronisation Operator → RTGS Account Holder: Request earmarking
3. RTGS Account Holder → API: POST /transactions/{id}/earmark
4. RT2 Settlement Engine → Earmarking Service: Earmark funds
5. [Same as Model 1 from step 4]


7.3 Model Configuration

{
  "models": {
    "MODEL_1": {
      "name": "Operator-Controlled",
      "earmarkingControl": "OPERATOR",
      "settlementControl": "OPERATOR",
      "cancellationControl": "OPERATOR",
      "permissions": {
        "initiateTransaction": ["OPERATOR"],
        "earmarkFunds": ["OPERATOR"],
        "settleFunds": ["OPERATOR"],
        "cancelTransaction": ["OPERATOR", "ACCOUNT_HOLDER"]
      }
    },
    "MODEL_2": {
      "name": "Hybrid Control",
      "earmarkingControl": "ACCOUNT_HOLDER",
      "settlementControl": "OPERATOR",
      "cancellationControl": "BOTH",
      "permissions": {
        "initiateTransaction": ["OPERATOR"],
        "earmarkFunds": ["ACCOUNT_HOLDER"],
        "settleFunds": ["OPERATOR"],
        "cancelTransaction": ["OPERATOR", "ACCOUNT_HOLDER"]
      }
    }
  }
}


8. Security Architecture
8.1 Authentication & Authorization
Identity Provider: Keycloak (Open Source) or AWS Cognito

┌─────────────────────────────────────────────┐
│         Identity & Access Management         │
├─────────────────────────────────────────────┤
│                                               │
│  Authentication:                              │
│  ├─── OAuth 2.0 / OpenID Connect             │
│  ├─── JWT tokens (15-minute expiry)          │
│  ├─── Refresh tokens (7-day expiry)          │
│  └─── API Keys for service-to-service        │
│                                               │
│  Authorization:                               │
│  ├─── Role-Based Access Control (RBAC)       │
│  ├─── Attribute-Based Access Control (ABAC)  │
│  └─── Fine-grained permissions               │
│                                               │
│  Multi-Factor Authentication (MFA):          │
│  └─── Required for admin access              │
│                                               │
└─────────────────────────────────────────────┘


Roles:
	∙	lab-participant: Basic transaction operations
	∙	lab-participant-admin: Full participant operations + configuration
	∙	lab-administrator: Platform management
	∙	lab-auditor: Read-only audit access
8.2 Network Security

Network Layers:
  - Internet Gateway (with DDoS protection - AWS Shield)
  - Web Application Firewall (WAF) - AWS WAF / CloudFlare
  - API Gateway (rate limiting, throttling)
  - Service Mesh (mTLS between services - Istio)
  - Private Subnets (for databases and internal services)
  - VPC Peering (for participant connections)
  - VPN / Direct Connect (for high-security participants)

Security Groups:
  - api-gateway-sg: Allow 443 from internet
  - app-tier-sg: Allow from api-gateway-sg only
  - data-tier-sg: Allow from app-tier-sg only
  - ledger-tier-sg: Restricted to specific services


8.3 Data Security

Encryption:
  At Rest:
    - Database: AES-256 (AWS RDS encryption)
    - Object Storage: AES-256 (S3 encryption)
    - DLT: Native encryption
  In Transit:
    - TLS 1.3 for all API communication
    - mTLS for service-to-service
    
Key Management:
  - AWS KMS / HashiCorp Vault
  - Automatic key rotation (90 days)
  - Hardware Security Modules (HSM) for DLT keys
  
Data Classification:
  - PUBLIC: General documentation
  - INTERNAL: Participant information
  - CONFIDENTIAL: Transaction data
  - RESTRICTED: Settlement records, audit logs

PII Handling:
  - Minimal collection
  - Pseudonymization where possible
  - GDPR compliance (right to erasure - with exceptions for audit)


8.4 API Security

Protection Mechanisms:
  - Rate Limiting: 1000 req/min per participant (burst: 1500)
  - Throttling: Progressive back-off
  - IP Whitelisting: Optional per participant
  - Request Signing: HMAC-SHA256 for critical operations
  - Input Validation: Schema validation (JSON Schema)
  - SQL Injection Protection: Parameterized queries
  - XSS Protection: Output encoding
  - CSRF Protection: Token-based
  
Webhook Security:
  - HMAC signature verification
  - Replay attack prevention (timestamp + nonce)
  - TLS certificate validation


9. Monitoring & Observability
9.1 Metrics Collection
Prometheus Metrics:

Business Metrics:
  - rt2_transactions_total (counter) by status, model, participant
  - rt2_transaction_duration_seconds (histogram)
  - rt2_earmark_active_count (gauge)
  - rt2_settlement_amount_total (counter)
  - rt2_liquidity_available (gauge) by account
  
Technical Metrics:
  - http_request_duration_seconds (histogram)
  - http_requests_total (counter) by endpoint, status
  - grpc_request_duration_seconds (histogram)
  - kafka_consumer_lag (gauge) by topic, partition
  - jvm_memory_used_bytes (gauge) for Java services
  - go_goroutines (gauge) for Go services
  
Infrastructure Metrics:
  - container_cpu_usage_seconds_total
  - container_memory_usage_bytes
  - node_disk_io_time_seconds_total


9.2 Logging
ELK Stack Configuration:

Log Levels:
  - TRACE: Detailed diagnostic (dev only)
  - DEBUG: Diagnostic information
  - INFO: General information
  - WARN: Warning conditions
  - ERROR: Error conditions
  - FATAL: Critical failures

Log Structure (JSON):
  {
    "timestamp": "2026-03-15T10:30:00.123Z",
    "level": "INFO",
    "service": "settlement-service",
    "traceId": "abc-123",
    "spanId": "def-456",
    "participantId": "PART-001",
    "transactionId": "TXN-001",
    "message": "Transaction settled successfully",
    "duration": 123,
    "metadata": {}
  }

Log Retention:
  - Hot storage (Elasticsearch): 30 days
  - Warm storage (S3): 1 year
  - Cold storage (Glacier): 7 years (compliance)


9.3 Distributed Tracing
Jaeger Configuration:

Tracing:
  - Sample Rate: 100% (lab environment)
  - Baggage: participantId, transactionId, model
  - Context Propagation: W3C Trace Context standard
  
Trace Spans:
  - api.request
  - service.operation
  - database.query
  - kafka.produce
  - kafka.consume
  - dlr.transaction


9.4 Alerting
Alert Definitions:

Critical Alerts (PagerDuty):
  - Service Down: Any service unavailable > 1 minute
  - DLT Consensus Failure: Consensus not reached
  - Database Connection Pool Exhausted
  - Kafka Consumer Lag > 10000 messages
  
Warning Alerts (Slack):
  - High Error Rate: >5% errors in 5 minutes
  - High Latency: P95 > 2 seconds
  - Low Liquidity: Available balance < threshold
  - Certificate Expiry: < 30 days
  
Business Alerts:
  - High Transaction Failure Rate: >10% in 10 minutes
  - Earmark Expiry Rate: >20% expired
  - Settlement Delays: Average time > SLA


9.5 Dashboards
Grafana Dashboards:
	1.	Executive Dashboard
	∙	Total transactions (by status, model)
	∙	Active participants
	∙	Settlement success rate
	∙	Average settlement time
	2.	Operational Dashboard
	∙	Service health status
	∙	API response times
	∙	Error rates
	∙	Queue depths
	3.	Participant Dashboard (per participant)
	∙	Their transaction volume
	∙	Success/failure rates
	∙	API usage
	∙	Account balances
	4.	DLT Dashboard
	∙	Block creation rate
	∙	Endorsement times
	∙	Peer status
	∙	Chaincode execution times

10. Deployment Architecture
10.1 Kubernetes Deployment

apiVersion: apps/v1
kind: Deployment
metadata:
  name: settlement-service
  namespace: rt2-lab
spec:
  replicas: 3
  selector:
    matchLabels:
      app: settlement-service
  template:
    metadata:
      labels:
        app: settlement-service
        version: v1
    spec:
      serviceAccountName: settlement-service-sa
      containers:
      - name: settlement-service
        image: rt2lab.ecr.eu-west-2.amazonaws.com/settlement-service:1.0.0
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9090
          name: grpc
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: KAFKA_BROKERS
          value: "kafka-bootstrap.kafka.svc.cluster.local:9092"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: settlement-service
  namespace: rt2-lab
spec:
  selector:
    app: settlement-service
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: grpc
    port: 9090
    targetPort: 9090
  type: ClusterIP


10.2 Infrastructure as Code (Terraform)

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "rt2-lab-cluster"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      desired_size = 3
      min_size     = 3
      max_size     = 10

      instance_types = ["m5.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
  }
}

# RDS PostgreSQL
module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "rt2-lab-db"

  engine               = "postgres"
  engine_version       = "15.3"
  family               = "postgres15"
  major_engine_version = "15"
  instance_class       = "db.r6g.xlarge"

  allocated_storage     = 100
  max_allocated_storage = 1000

  db_name  = "rt2lab"
  username = "rt2admin"
  port     = 5432

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.rt2_db.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"

  backup_retention_period = 30
  skip_final_snapshot     = false
  deletion_protection     = true

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
}

# MSK (Managed Kafka)
resource "aws_msk_cluster" "rt2_kafka" {
  cluster_name           = "rt2-lab-kafka"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = module.vpc.private_subnets
    security_groups = [aws_security_group.kafka.id]
    
    storage_info {
      ebs_storage_info {
        volume_size = 100
      }
    }
  }

  encryption_info {
    encryption_at_rest_kms_key_arn = aws_kms_key.kafka.arn
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.kafka.name
      }
    }
  }
}


10.3 CI/CD Pipeline

# GitLab CI Pipeline
stages:
  - build
  - test
  - security
  - deploy-dev
  - deploy-staging
  - deploy-production

variables:
  DOCKER_REGISTRY: rt2lab.ecr.eu-west-2.amazonaws.com

build:
  stage: build
  script:
    - docker build -t $DOCKER_REGISTRY/settlement-service:$CI_COMMIT_SHA .
    - docker push $DOCKER_REGISTRY/settlement-service:$CI_COMMIT_SHA

unit-tests:
  stage: test
  script:
    - mvn clean test
    - mvn jacoco:report
  artifacts:
    reports:
      junit: target/surefire-reports/*.xml
      coverage_report:
        coverage_format: cobertura
        path: target/site/jacoco/jacoco.xml

integration-tests:
  stage: test
  script:
    - docker-compose up -d postgres kafka
    - mvn verify -P integration-tests

security-scan:
  stage: security
  script:
    - trivy image $DOCKER_REGISTRY/settlement-service:$CI_COMMIT_SHA
    - snyk test --severity-threshold=high

deploy-dev:
  stage: deploy-dev
  script:
    - kubectl config use-context dev-cluster
    - helm upgrade --install settlement-service ./helm/settlement-service 
        --set image.tag=$CI_COMMIT_SHA 
        --namespace rt2-lab-dev
  environment:
    name: development
  only:
    - develop

deploy-production:
  stage: deploy-production
  script:
    - kubectl config use-context prod-cluster
    - helm upgrade --install settlement-service ./helm/settlement-service 
        --set image.tag=$CI_COMMIT_SHA 
        --namespace rt2-lab-prod
  environment:
    name: production
  when: manual
  only:
    - main


11. Data Management
11.1 Database Schema (PostgreSQL)

-- Participants
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    participant_code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'OPERATOR', 'RTGS_HOLDER'
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    api_key_hash VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_number VARCHAR(50) UNIQUE NOT NULL,
    participant_id UUID NOT NULL REFERENCES participants(id),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    earmarked_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    available_balance DECIMAL(18,2) GENERATED ALWAYS AS (balance - earmarked_balance) STORED,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1 -- Optimistic locking
);

CREATE INDEX idx_accounts_participant ON accounts(participant_id);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    participant_id UUID NOT NULL REFERENCES participants(id),
    model VARCHAR(20) NOT NULL, -- 'MODEL_1', 'MODEL_2', etc.
    type VARCHAR(50) NOT NULL, -- 'DVP', 'PVP', 'HOUSE_PURCHASE', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'INITIATED',
    payer_account_id UUID REFERENCES accounts(id),
    payee_account_id UUID REFERENCES accounts(id),
    amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    asset_ledger_id VARCHAR(255),
    asset_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    settled_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_transactions_participant ON transactions(participant_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- Earmarks
CREATE TABLE earmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    earmark_code VARCHAR(100) UNIQUE NOT NULL,
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    account_id UUID NOT NULL REFERENCES accounts(id),
    amount DECIMAL(18,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    released_at TIMESTAMP,
    settled_at TIMESTAMP
);

CREATE INDEX idx_earmarks_transaction ON earmarks(transaction_id);
CREATE INDEX idx_earmarks_account ON earmarks(account_id);
CREATE INDEX idx_earmarks_status_expiry ON earmarks(status, expiry_time);

-- Account Movements (Ledger)
CREATE TABLE account_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id),
    transaction_id UUID REFERENCES transactions(id),
    movement_type VARCHAR(50) NOT NULL, -- 'EARMARK', 'RELEASE', 'SETTLEMENT', 'CREDIT', 'DEBIT'
    amount DECIMAL(18,2) NOT NULL,
    balance_before DECIMAL(18,2) NOT NULL,
    balance_after DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_movements_account_time ON account_movements(account_id, created_at DESC);
CREATE INDEX idx_movements_transaction ON account_movements(transaction_id);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID,
    actor_type VARCHAR(50),
    changes JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);


11.2 Caching Strategy (Redis)

Cache Layers:
  L1 (Application):
    - In-memory cache for frequently accessed reference data
    - TTL: 5 minutes
    
  L2 (Redis):
    - Session data
    - API rate limiting counters
    - Real-time account balances
    - Active transaction states
    
Cache Patterns:
  Cache-Aside:
    - Read: Check cache → Miss → Query DB → Write to cache
    - Write: Update DB → Invalidate cache
    
  Write-Through:
    - Critical balance updates
    - Write to cache and DB synchronously
    
  Cache Invalidation:
    - Event-based invalidation
    - TTL-based expiry (15-60 minutes depending on data)

Redis Keys:
  - account:{accountId}:balance
  - transaction:{transactionId}:status
  - participant:{participantId}:ratelimit:{window}
  - session:{sessionId}


11.3 Data Retention & Archival

Retention Policies:
  Operational Data (PostgreSQL):
    - Active transactions: Until 30 days after settlement
    - Historical transactions: 1 year in hot storage
    - Archived transactions: 7 years (cold storage S3/Glacier)
    
  Ledger Data (DLT):
    - Permanent (immutable)
    - Snapshot every 10,000 blocks for performance
    
  Logs:
    - Application logs: 30 days hot, 1 year warm
    - Audit logs: 7 years (compliance)
    - Access logs: 90 days
    
  Metrics:
    - Raw metrics: 30 days
    - Aggregated metrics (1h): 1 year
    - Aggregated metrics (1d): 7 years

Archival Process:
  1. Identify records older than retention period
  2. Export to Parquet format
  3. Compress and encrypt
  4. Upload to S3 Glacier
  5. Update database with archive reference
  6. Delete from operational database


12. Disaster Recovery & Business Continuity
12.1 Backup Strategy

Database Backups:
  Automated Backups (RDS):
    - Frequency: Daily
    - Retention: 30 days
    - Backup window: 03:00-06:00 GMT
    - Automated snapshots
    
  Manual Backups:
    - Before major releases
    - Before schema changes
    - Retention: 90 days
    
  Point-in-Time Recovery:
    - Enabled: Yes
    - Recovery window: Last 30 days
    
DLT Backups:
  - Peer node backups: Daily
  - Orderer backups: Daily
  - Channel snapshots: After every 1000 blocks
  - Retention: 90 days
  
Configuration Backups:
  - Kubernetes manifests: Git repository
  - Terraform state: S3 with versioning
  - Secrets: Vault backups (encrypted)


12.2 Disaster Recovery

RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 15 minutes

DR Architecture:
  Primary Region: eu-west-2 (London)
  DR Region: eu-west-1 (Ireland)
  
  Replication:
    - Database: Multi-AZ + Cross-region read replicas
    - Object Storage: Cross-region replication
    - Kafka: MirrorMaker 2.0 for cross-region replication
    - DLT: Peer nodes in both regions
    
Failover Process:
  1. Automated health checks detect primary failure
  2. DNS failover to DR region (Route 53)
  3. Promote read replica to primary database
  4. Activate DR Kafka cluster
  5. Scale up DR application services
  6. Verify DLT consensus
  7. Resume operations
  
  Automated: Steps 1-2
  Manual: Steps 3-7 (with runbooks)

Failback Process:
  - After primary region restored
  - Scheduled maintenance window
  - Reverse replication direction
  - Gradual traffic migration (blue-green)


12.3 Testing

DR Testing Schedule:
  - Tabletop exercises: Quarterly
  - Partial DR test: Semi-annually
  - Full DR failover: Annually
  
Test Scenarios:
  1. Primary database failure
  2. Complete region outage
  3. Network partition
  4. DLT peer node failure
  5. Kafka cluster failure
  6. Ransomware attack simulation


13. Participant Integration
13.1 Onboarding Process

Phase 1: Registration (Week 1)
- Submit application
- KYC/AML checks
- Sign terms of participation
- Receive participant credentials

Phase 2: Technical Setup (Weeks 2-3)
- Provision sandbox environment
- Generate API keys (primary + backup)
- Configure webhook endpoints
- Set up IP whitelisting (optional)
- Install TLS certificates

Phase 3: Integration Development (Weeks 4-7)
- Access technical documentation
- SDK/library access (Java, Python, Node.js)
- Postman collection for API testing
- Sample code and reference implementations
- Integration with test asset ledgers

Phase 4: Testing (Week 8)
- Unit testing with mock data
- Integration testing with Lab platform
- End-to-end scenario testing
- Performance testing
- Security testing

Phase 5: Go-Live (Week 9)
- Production credentials
- Final security audit
- Readiness review
- Go-live approval


13.2 SDK & Libraries
Java SDK:

// RT2 Lab Java SDK
import com.bankofengland.rt2lab.client.RT2LabClient;
import com.bankofengland.rt2lab.model.*;

public class SynchronisationOperator {
    private RT2LabClient client;
    
    public SynchronisationOperator(String apiKey, String apiSecret) {
        this.client = RT2LabClient.builder()
            .apiKey(apiKey)
            .apiSecret(apiSecret)
            .environment(Environment.LAB)
            .build();
    }
    
    public Transaction initiateTransaction(TransactionRequest request) {
        return client.transactions().create(request);
    }
    
    public Earmark requestEarmark(String transactionId, EarmarkRequest request) {
        return client.transactions().earmark(transactionId, request);
    }
    
    public void settle(String transactionId) {
        client.transactions().settle(transactionId);
    }
    
    public void registerWebhook(String url, List<String> events) {
        WebhookRequest request = WebhookRequest.builder()
            .url(url)
            .events(events)
            .build();
        client.webhooks().register(request);
    }
}


Python SDK:

from rt2lab import RT2LabClient, TransactionRequest, EarmarkRequest

class SynchronisationOperator:
    def __init__(self, api_key, api_secret):
        self.client = RT2LabClient(
            api_key=api_key,
            api_secret=api_secret,
            environment='lab'
        )
    
    def initiate_transaction(self, request: TransactionRequest):
        return self.client.transactions.create(request)
    
    def request_earmark(self, transaction_id, request: EarmarkRequest):
        return self.client.transactions.earmark(transaction_id, request)
    
    def settle(self, transaction_id):
        self.client.transactions.settle(transaction_id)
    
    async def listen_to_events(self, callback):
        async with self.client.stream() as stream:
            async for event in stream:
                await callback(event)


13.3 Reference Implementation
Mock Asset Ledger Integration:

const RT2LabClient = require('@rt2lab/node-sdk');
const AssetLedgerClient = require('./asset-ledger-client');

class DVPOrchestrator {
    constructor(rt2Config, assetConfig) {
        this.rt2Client = new RT2LabClient(rt2Config);
        this.assetClient = new AssetLedgerClient(assetConfig);
    }
    
    async executeDVP(trade) {
        // Step 1: Initiate RT2 transaction
        const rt2Transaction = await this.rt2Client.transactions.create({
            model: 'MODEL_1',
            type: 'DVP',
            payerAccount: trade.buyer.rtgsAccount,
            payeeAccount: trade.seller.rtgsAccount,
            amount: {
                value: trade.amount,
                currency: 'GBP'
            },
            assetDetails: {
                ledgerId: trade.assetLedger,
                assetId: trade.securityId
            }
        });
        
        // Step 2: Request fund earmarking
        await this.rt2Client.transactions.earmark(rt2Transaction.id, {
            accountId: trade.buyer.rtgsAccount,
            amount: trade.amount,
            expiryMinutes: 60
        });
        
        // Step 3: Wait for earmarking confirmation
        await this.waitForEvent('transaction.earmarked', rt2Transaction.id);
        
        // Step 4: Lock asset on asset ledger
        const assetLock = await this.assetClient.lockAsset({
            assetId: trade.securityId,
            fromAccount: trade.seller.assetAccount,
            toAccount: trade.buyer.assetAccount,
            expiryMinutes: 60
        });
        
        // Step 5: Coordinate settlement
        try {
            // Settle on RT2
            await this.rt2Client.transactions.settle(rt2Transaction.id);
            
            // Transfer asset
            await this.assetClient.transferAsset(assetLock.id);
            
            console.log('DVP completed successfully');
        } catch (error) {
            // Rollback on failure
            await this.rt2Client.transactions.cancel(rt2Transaction.id);
            await this.assetClient.unlockAsset(assetLock.id);
            
            console.error('DVP failed, rolled back', error);
            throw error;
        }
    }
    
    async waitForEvent(eventType, transactionId, timeout = 60000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Timeout waiting for event'));
            }, timeout);
            
            this.rt2Client.on(eventType, (event) => {
                if (event.data.transactionId === transactionId) {
                    clearTimeout(timer);
                    resolve(event);
                }
            });
        });
    }
}


14. Performance & Scalability
14.1 Performance Requirements

Throughput:
  - Peak: 1000 transactions per second
  - Sustained: 500 transactions per second
  - Concurrent participants: 20+
  
Latency (P95):
  - API response time: < 500ms
  - Earmarking: < 1 second
  - Settlement: < 2 seconds
  - End-to-end DVP: < 5 seconds
  
Availability:
  - Target: 99.9% (8.76 hours downtime/year)
  - Maintenance windows: Planned, communicated 1 week in advance
  
Scalability:
  - Horizontal scaling for stateless services
  - Database read replicas for read-heavy operations
  - Kafka partitioning for event parallelism
  - DLT peer node scaling


14.2 Load Testing Strategy

Tools:
  - JMeter / Gatling for API load testing
  - Locust for distributed load generation
  - K6 for cloud-native load testing
  
Test Scenarios:
  1. Baseline: Normal load (100 TPS)
  2. Peak Load: 1000 TPS for 5 minutes
  3. Stress Test: Increase until failure
  4. Soak Test: 500 TPS for 24 hours
  5. Spike Test: Sudden increase from 100 to 1000 TPS
  
Performance Metrics:
  - Response time (min, avg, max, P95, P99)
  - Throughput (requests/second)
  - Error rate
  - Resource utilization (CPU, memory, disk, network)


14.3 Optimization Strategies

Application Layer:
  - Connection pooling (database, HTTP)
  - Caching (Redis, application-level)
  - Async processing where possible
  - Batch operations for bulk updates
  - Query optimization (indexes, query tuning)
  
Database Layer:
  - Read replicas for read-heavy operations
  - Partitioning large tables
  - Materialized views for complex queries
  - Query result caching
  
Network Layer:
  - CDN for static content
  - HTTP/2 and HTTP/3 support
  - Connection multiplexing
  - Compression (gzip, brotli)
  
DLT Layer:
  - Channel-based isolation
  - Private data collections for privacy
  - Bulk endorsement where applicable
  - Periodic pruning of old data


15. Compliance & Governance
15.1 Regulatory Compliance

Regulations:
  - UK GDPR (Data Protection Act 2018)
  - PCI DSS (if handling card data - N/A for Lab)
  - PSD2 (Payment Services Directive) - Principles
  - DORA (Digital Operational Resilience Act)
  
Data Residency:
  - All data stored in UK (London region)
  - DR in Ireland (EU region) - compliant
  - No data transfer outside UK/EU
  
Data Protection:
  - Data Protection Impact Assessment (DPIA) completed
  - Privacy by Design principles
  - Data minimization
  - Right to erasure (with audit exceptions)
  - Consent management


15.2 Audit & Compliance

Audit Trail:
  - Immutable audit log in DLT
  - All API calls logged
  - All database changes tracked
  - Tamper-evident logging
  
Compliance Monitoring:
  - Automated compliance checks
  - Regular security audits
  - Penetration testing (annually)
  - Vulnerability scanning (weekly)
  
Certifications (Planned):
  - ISO 27001 (Information Security)
  - SOC 2 Type II
  - Cyber Essentials Plus


15.3 Governance

Governance Structure:
  - Steering Committee: Bank of England representatives
  - Technical Advisory Board: Industry experts
  - Participant Working Group: Lab participants
  
Change Management:
  - RFC (Request for Change) process
  - Impact assessment
  - Participant notification (2 weeks for breaking changes)
  - Versioned APIs (backward compatibility)
  
Documentation:
  - Technical documentation (always up-to-date)
  - API reference (OpenAPI spec)
  - Integration guides
  - Runbooks for operations
  - Disaster recovery procedures


16. Cost Estimation
16.1 Infrastructure Costs (Monthly - AWS UK Region)

Compute (EKS):
  - 6x m5.xlarge nodes: £720
  - Auto-scaling (average): £300
  
Database (RDS PostgreSQL):
  - db.r6g.xlarge Multi-AZ: £600
  - Storage (500GB): £80
  - Backup storage (1TB): £95
  
Kafka (MSK):
  - 3x kafka.m5.large: £450
  - Storage (300GB): £30
  
Cache (ElastiCache Redis):
  - 3x cache.r6g.large: £400
  
Load Balancer:
  - Application Load Balancer: £20
  - Data transfer: £50
  
Monitoring & Logging:
  - CloudWatch: £100
  - ELK Stack (self-hosted on EC2): £200
  
DLT Infrastructure:
  - 4x m5.xlarge for peer nodes: £480
  - Storage (2TB): £160
  
Networking:
  - VPN connections: £80
  - Data transfer: £200
  
Backup & DR:
  - S3 storage (5TB): £115
  - Cross-region replication: £100
  
Total Monthly: ~£4,180

6-Month Lab Operation: ~£25,000


16.2 Development Costs (One-Time)

Team (8 months - design, build, test):
  - Solution Architect (1): £80,000
  - Backend Developers (3): £180,000
  - DevOps Engineer (1): £45,000
  - QA Engineer (1): £40,000
  - Security Specialist (1 part-time): £30,000
  - Technical Writer (1 part-time): £20,000
  
Tools & Licenses:
  - Development tools: £10,000
  - Testing tools: £5,000
  - Monitoring tools: £8,000
  
Third-Party Services:
  - DLT consultancy: £30,000
  - Security audit: £20,000
  - Penetration testing: £15,000
  
Total Development: ~£483,000

Grand Total (Dev + 6 months ops): ~£508,000


17. Timeline & Milestones
17.1 Project Timeline

Months 1-2: Design & Architecture
├─ Week 1-2: Requirements finalization
├─ Week 3-4: Architecture design
├─ Week 5-6: Technology selection
└─ Week 7-8: Technical specification & review

Months 3-5: Development
├─ Sprint 1-2: Core infrastructure setup
│   ├─ Kubernetes cluster
│   ├─ CI/CD pipeline
│   └─ Monitoring setup
├─ Sprint 3-4: Settlement engine services
│   ├─ Transaction orchestration
│   ├─ Earmarking service
│   └─ Settlement execution
├─ Sprint 5-6: DLT integration
│   ├─ Hyperledger Fabric setup
│   ├─ Smart contracts
│   └─ Integration layer
├─ Sprint 7-8: API layer & user interface
│   ├─ API gateway
│   ├─ REST/gRPC APIs
│   └─ Admin console
└─ Sprint 9-10: Supporting services
    ├─ Participant management
    ├─ Analytics
    └─ Notifications

Month 6: Integration & Testing
├─ Week 1-2: Integration testing
├─ Week 3: Performance testing
├─ Week 4: Security testing & audit

Months 7-8: Participant Onboarding
├─ Week 1-2: Documentation finalization
├─ Week 3-4: Onboarding first batch (10 participants)
├─ Week 5-6: Onboarding second batch (8 participants)
├─ Week 7-8: Integration support & bug fixes

Month 9: Lab Launch (Spring 2026)
└─ Official launch with all 18 participants

Months 9-14: Lab Operation (6 months)
├─ Continuous support
├─ Monitoring & optimization
├─ Use case demonstrations
└─ Learning capture

Month 15: Wrap-up & Reporting
├─ Week 1-2: Data analysis
├─ Week 3: Industry showcase event
└─ Week 4: Final report publication


18. Risk Management
18.1 Technical Risks



|Risk                             |Probability|Impact  |Mitigation                                                   |
|---------------------------------|-----------|--------|-------------------------------------------------------------|
|DLT performance issues           |Medium     |High    |Early performance testing, alternative consensus mechanisms  |
|Integration complexity           |High       |Medium  |Comprehensive APIs, SDKs, reference implementations          |
|Scalability bottlenecks          |Medium     |High    |Load testing, horizontal scaling, caching strategies         |
|Data inconsistency across systems|Medium     |High    |Event sourcing, idempotency, reconciliation service          |
|Security vulnerabilities         |Low        |Critical|Regular security audits, pen testing, secure coding practices|
|Cloud provider outage            |Low        |High    |Multi-region DR, cloud-agnostic architecture (Kubernetes)    |

18.2 Operational Risks



|Risk                             |Probability|Impact|Mitigation                                                      |
|---------------------------------|-----------|------|----------------------------------------------------------------|
|Participant onboarding delays    |Medium     |Medium|Early engagement, comprehensive documentation, dedicated support|
|Insufficient test data/scenarios |Low        |Medium|Work with participants to define realistic scenarios            |
|Expertise shortage (DLT, fintech)|Medium     |High  |Early recruitment, external consultants, training               |
|Scope creep                      |High       |Medium|Clear requirements, change management process                   |
|Budget overrun                   |Medium     |High  |Regular cost monitoring, contingency buffer (20%)               |

19. Success Metrics
19.1 Technical KPIs

Performance:
  - API response time P95 < 500ms: ✓
  - Settlement latency < 2 seconds: ✓
  - System availability > 99.9%: ✓
  - Zero data loss incidents: ✓
  
Scalability:
  - Support 20+ concurrent participants: ✓
  - Handle 1000 TPS peak load: ✓
  - No degradation under sustained load: ✓
  
Integration:
  - 18 participants successfully onboarded: ✓
  - < 5 days average integration time: ✓
  - < 10 critical bugs during operation: ✓


19.2 Business KPIs

Adoption:
  - All 18 participants actively demonstrating use cases: ✓
  - Average 100+ transactions per participant per week: ✓
  - At least 5 different use case types demonstrated: ✓
  
Learning:
  - Comprehensive final report published: ✓
  - At least 10 design insights captured: ✓
  - Industry showcase event with 100+ attendees: ✓
  
Ecosystem:
  - 50+ synchronisation users engaged: ✓
  - Positive feedback from 80%+ participants: ✓
  - Clear path to production deployment defined: ✓


20. Next Steps & Recommendations
20.1 Immediate Actions (Month 1)
	1.	Finalize Architecture: Review this spec with stakeholders
	2.	Assemble Team: Recruit/assign development team
	3.	Procurement: Initiate cloud services procurement
	4.	Participant Engagement: Begin early discussions with selected participants
	5.	Security Review: Conduct initial security architecture review
20.2 Critical Success Factors
	1.	Early Participant Involvement: Engage participants in design phase
	2.	Robust Testing: Invest heavily in testing infrastructure
	3.	Clear Documentation: Maintain up-to-date, comprehensive docs
	4.	Dedicated Support: Provide hands-on integration support
	5.	Flexible Architecture: Design for change and extensibility
20.3 Future Considerations

Beyond Lab (Production Deployment):
  - Regulatory approval process
  - Production-grade infrastructure (higher SLAs)
  - Legal framework for live operations
  - Expanded governance model
  - Additional security certifications
  - Integration with existing RTGS systems
  - Gradual rollout strategy
  
Technology Evolution:
  - Explore quantum-resistant cryptography
  - Consider other DLT platforms (e.g., R3 Corda for regulated assets)
  - AI/ML for fraud detection and liquidity optimization
  - ISO 20022 message standards integration
  - Central Bank Digital Currency (CBDC) readiness


Appendix
A. Glossary
	∙	RT2: Renewed RTGS (Real-Time Gross Settlement) system
	∙	Synchronisation: Atomic settlement coordination across systems
	∙	Earmarking: Temporary reservation of funds
	∙	DVP: Delivery vs Payment (securities for cash)
	∙	PVP: Payment vs Payment (cross-border FX)
	∙	DLT: Distributed Ledger Technology
B. References
	∙	Project Meridian: https://www.bankofengland.co.uk/research/digital-currencies
	∙	ISO 20022: https://www.iso20022.org/
	∙	Hyperledger Fabric: https://www.hyperledger.org/use/fabric
	∙	Cloud Events Specification: https://cloudevents.io/
C. Contact Information

Bank of England - RTGS Development Team
Email: rt2lab@bankofengland.co.uk
Website: https://www.bankofengland.co.uk/rt2-synchronisation-lab


Document Version: 1.0Date: February 2026Status: Draft for ReviewAuthor: Technical Architecture Team
