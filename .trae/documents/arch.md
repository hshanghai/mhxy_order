## 1. 架构设计
```mermaid
graph TB
    A["React 前端"] --> B["LocalStorage 数据存储"]
    A --> C["React Router 路由管理"]
    A --> D["Tailwind CSS 样式"]
    A --> E["状态管理 (React Hooks)"]
```

## 2. 技术描述
- **前端**：React@18 + TypeScript + Tailwind CSS@3 + Vite
- **初始化工具**：vite-init
- **后端**：无，使用 LocalStorage 存储数据
- **数据库**：LocalStorage（JSON格式）

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 首页/人物列表 |
| /character/:id | 人物详情（展示消费和收入分类） |
| /character/:id/expense/:type | 消费记录详情页 |
| /character/:id/income/:type | 收入记录详情页 |

## 4. 数据模型

### 4.1 数据模型定义
```mermaid
erDiagram
    CHARACTER ||--o{ EXPENSE : has
    CHARACTER ||--o{ INCOME : has
    CHARACTER {
        string id
        string name
        string server
        string createdAt
    }
    EXPENSE {
        string id
        string characterId
        string type
        number amount
        string date
        string note
    }
    INCOME {
        string id
        string characterId
        string type
        number amount
        string date
        string note
    }
```

### 4.2 TypeScript 类型定义
```typescript
interface Character {
  id: string;
  name: string;
  server: string;
  createdAt: string;
}

interface Expense {
  id: string;
  characterId: string;
  type: 'point' | 'month' | 'year' | 'equipment' | 'pet';
  amount: number;
  date: string;
  note: string;
}

interface Income {
  id: string;
  characterId: string;
  type: 'money' | 'pet' | 'equipment';
  amount: number;
  date: string;
  note: string;
}
```

## 5. 核心组件设计
- `CharacterList`：人物列表组件
- `CharacterCard`：人物卡片组件
- `RecordList`：记录列表组件
- `AddCharacterForm`：添加人物表单组件
- `AddRecordForm`：添加记录表单组件
