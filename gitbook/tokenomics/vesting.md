---
description: Token vesting schedules ensuring long-term commitment and stability.
---

# 🔒 Vesting Schedule

## 🌳 Overview

Sylvan Token implements a comprehensive vesting system to ensure long-term stability and prevent market manipulation. Different stakeholder groups have tailored vesting schedules.

---

## 📅 Vesting Schedules Summary

| Wallet Type | Immediate | Vesting Period | Monthly Release | Burn per Release |
|-------------|-----------|----------------|-----------------|------------------|
| **Locked Reserve** | 0% | 34 months | 3% | 10% |
| **Advisors & Partners** | 10% | 20 months | 5% | 0% |
| **Team & Founders** | 0% | 12-month lock | N/A | 0% |

---

## 🔐 Locked Reserve (300M SYL)

### Schedule Details

```
Locked Reserve Vesting (34 Months):

Month 0:  ████████████████████████████████ 300M SYL (Locked)
Month 1:  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 9M released (3%)
                                            └─ 0.9M burned (10%)
                                            └─ 8.1M available
Month 2:  ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 9M released
...
Month 34: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Fully vested
```

### Key Parameters

| Parameter | Value |
|-----------|-------|
| **Total Amount** | 300,000,000 SYL |
| **Vesting Duration** | 34 months |
| **Monthly Release** | 3% (~9M SYL) |
| **Burn Rate** | 10% per release |
| **Total Burned** | ~30.6M SYL over vesting period |
| **Net Released** | ~269.4M SYL |

{% hint style="info" %}
**Proportional Burning:** 10% of each monthly release is automatically burned, adding to the deflationary mechanism.
{% endhint %}

---

## 🤝 Advisors & Partners (40M SYL)

### Schedule Details

```
Advisor Vesting (20 Months):

Month 0:  ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 4M SYL (10% immediate)
Month 1:  ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░ +2M SYL (5%)
Month 2:  ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░ +2M SYL (5%)
...
Month 20: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Fully vested
```

### Key Parameters

| Parameter | Value |
|-----------|-------|
| **Total Amount** | 40,000,000 SYL |
| **Immediate Release** | 10% (4M SYL) |
| **Vesting Duration** | 20 months |
| **Monthly Release** | 5% (2M SYL) |
| **Purpose** | Strategic partnership alignment |

---

## 👥 Team & Founders (160M SYL)

### Lock Period

| Parameter | Value |
|-----------|-------|
| **Total Amount** | 160,000,000 SYL |
| **Lock Period** | 12 months |
| **Immediate Access** | 0% |
| **Post-Lock** | Fully accessible |
| **Purpose** | Demonstrate long-term commitment |

{% hint style="success" %}
**Team Commitment:** The 12-month lock ensures the team is aligned with the project's long-term success.
{% endhint %}

---

## 🔥 Vesting Burn Impact

### Monthly Burn from Vesting

| Source | Monthly Amount | Burn Rate | Monthly Burn |
|--------|---------------|-----------|--------------|
| Locked Reserve | ~9M SYL | 10% | ~0.9M SYL |
| Advisors | 0% | 0% | 0 |
| **Total** | - | - | **~0.9M SYL** |

### Cumulative Vesting Burns

| Period | Cumulative Burn |
|--------|-----------------|
| Year 1 | ~10.8M SYL |
| Year 2 | ~21.6M SYL |
| End of Vesting | ~30.6M SYL |

---

## 📊 Release Timeline

```
2025 Q4:  ████░░░░░░░░░░░░░░░░ Month 1-4 releases
2026 Q1:  ████████░░░░░░░░░░░░ Month 5-8 releases
2026 Q2:  ████████████░░░░░░░░ Month 9-12 releases
2026 Q3:  ████████████████░░░░ Month 13-16 releases
2026 Q4:  ████████████████████ Month 17-20 releases (Advisors complete)
2027 Q1:  ████████████████████░░░░ Month 21-24 releases
2027 Q2:  ████████████████████████░░░░ Month 25-28 releases
2027 Q3:  ████████████████████████████░░ Month 29-32 releases
2027 Q4:  ████████████████████████████████ Month 33-34 (Reserve complete)
```

---

## 🛡️ Security Features

| Feature | Protection |
|---------|------------|
| **Time-Locked** | Cannot accelerate releases |
| **On-Chain** | All schedules verifiable |
| **Immutable** | Schedules cannot be changed |
| **Transparent** | Public claim tracking |
| **Cliff Periods** | Early dump prevention |

---

## ❓ FAQ

<details>
<summary><strong>Can vesting schedules be changed?</strong></summary>

No. Once set, vesting schedules are immutable and enforced by the smart contract.
</details>

<details>
<summary><strong>How can I verify vesting claims?</strong></summary>

All vesting claims are recorded on-chain and can be verified on BSCScan.
</details>

<details>
<summary><strong>What happens to unclaimed vested tokens?</strong></summary>

Tokens remain in the vesting contract until claimed by the designated wallet.
</details>
