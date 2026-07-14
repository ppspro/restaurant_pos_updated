# Risk Analysis and Mitigation Plan

| Risk | Impact | Likelihood | Mitigation Plan |
|------|--------|------------|-----------------|
| Database Offline | High | Low | Read-replicas, connection pool safety checks. |
| Network Outage | High | Medium | Local storage draft cache to hold cart states. |
| Printer Jam | Medium | High | Failover to browser HTML print mode. |
| Security Breach | High | Low | Standard JWT checks, encryption, periodic reviews. |
