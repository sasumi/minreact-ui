import { Form, FORM_DIR_AUTO, FORM_DIR_LANDSCAPE, FORM_DIR_PORTRAIT } from "@/components/Form";
import { PrimaryButton, NormalButton } from "@/components/Button";
import { useState } from "react";

function FormDemo() {
  const [formData, setFormData] = useState<any>(null);

  const handleSubmit = (e: any, data: any) => {
    console.log("Form data:", data);
    setFormData(data);
    alert("表单已提交，请查看控制台");
  };

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h2>Form 表单</h2>
        <p>完整的表单组件，包含表单项、表单分组、操作按钮等</p>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">基础用法</h3>
        <p className="demo-section-description">使用 Form, Form.Item, Form.Actions 构建表单</p>
        <div className="demo-example">
          <Form onSubmit={handleSubmit}>
            <Form.Item label="用户名">
              <input type="text" name="username" placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item label="密码">
              <input type="password" name="password" placeholder="请输入密码" />
            </Form.Item>
            <Form.Item label="邮箱">
              <input type="email" name="email" placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Actions>
              <NormalButton type="button">取消</NormalButton>
              <PrimaryButton tag="button" type="submit">
                提交
              </PrimaryButton>
            </Form.Actions>
          </Form>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">表单分组</h3>
        <p className="demo-section-description">使用 Form.Group 对表单项进行分组</p>
        <div className="demo-example">
          <Form onSubmit={handleSubmit}>
            <Form.Group title="基本信息">
              <Form.Item label="姓名">
                <input type="text" name="name" placeholder="请输入姓名" />
              </Form.Item>
              <Form.Item label="年龄">
                <input type="number" name="age" placeholder="请输入年龄" />
              </Form.Item>
            </Form.Group>
            <Form.Group title="联系方式">
              <Form.Item label="手机">
                <input type="tel" name="phone" placeholder="请输入手机号" />
              </Form.Item>
              <Form.Item label="地址">
                <input type="text" name="address" placeholder="请输入地址" />
              </Form.Item>
            </Form.Group>
            <Form.Actions>
              <PrimaryButton tag="button" type="submit">
                提交
              </PrimaryButton>
            </Form.Actions>
          </Form>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">表单布局方向</h3>
        <p className="demo-section-description">通过 dir 属性控制表单布局方向</p>
        <div className="demo-example">
          <h4 style={{ marginBottom: "1rem" }}>横向布局 (landscape)</h4>
          <Form dir={FORM_DIR_LANDSCAPE} onSubmit={handleSubmit}>
            <Form.Item label="姓名">
              <input type="text" name="name" placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item label="邮箱">
              <input type="email" name="email" placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Actions>
              <PrimaryButton tag="button" type="submit">
                提交
              </PrimaryButton>
            </Form.Actions>
          </Form>

          <h4 style={{ margin: "2rem 0 1rem" }}>纵向布局 (portrait)</h4>
          <Form dir={FORM_DIR_PORTRAIT} onSubmit={handleSubmit}>
            <Form.Item label="姓名">
              <input type="text" name="name" placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item label="邮箱">
              <input type="email" name="email" placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Actions>
              <PrimaryButton tag="button" type="submit">
                提交
              </PrimaryButton>
            </Form.Actions>
          </Form>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">多种表单控件</h3>
        <p className="demo-section-description">支持各种类型的表单控件</p>
        <div className="demo-example">
          <Form onSubmit={handleSubmit}>
            <Form.Item label="文本输入">
              <input type="text" name="text" placeholder="请输入文本" />
            </Form.Item>
            <Form.Item label="数字输入">
              <input type="number" name="number" placeholder="请输入数字" />
            </Form.Item>
            <Form.Item label="日期选择">
              <input type="date" name="date" />
            </Form.Item>
            <Form.Item label="颜色选择">
              <input type="color" name="color" />
            </Form.Item>
            <Form.Item label="下拉选择">
              <select name="select">
                <option value="">请选择</option>
                <option value="1">选项1</option>
                <option value="2">选项2</option>
                <option value="3">选项3</option>
              </select>
            </Form.Item>
            <Form.Item label="多行文本">
              <textarea name="textarea" placeholder="请输入多行文本" rows={4}></textarea>
            </Form.Item>
            <Form.Item label="单选框">
              <div>
                <label style={{ marginRight: "1rem" }}>
                  <input type="radio" name="radio" value="1" /> 选项1
                </label>
                <label style={{ marginRight: "1rem" }}>
                  <input type="radio" name="radio" value="2" /> 选项2
                </label>
                <label>
                  <input type="radio" name="radio" value="3" /> 选项3
                </label>
              </div>
            </Form.Item>
            <Form.Item label="复选框">
              <div>
                <label style={{ marginRight: "1rem" }}>
                  <input type="checkbox" name="checkbox1" value="1" /> 选项1
                </label>
                <label style={{ marginRight: "1rem" }}>
                  <input type="checkbox" name="checkbox2" value="2" /> 选项2
                </label>
                <label>
                  <input type="checkbox" name="checkbox3" value="3" /> 选项3
                </label>
              </div>
            </Form.Item>
            <Form.Actions>
              <PrimaryButton tag="button" type="submit">
                提交
              </PrimaryButton>
            </Form.Actions>
          </Form>
        </div>
      </div>

      {formData && (
        <div className="demo-section">
          <h3 className="demo-section-title">表单数据</h3>
          <p className="demo-section-description">最后提交的表单数据</p>
          <div className="demo-example">
            <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px", overflow: "auto" }}>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormDemo;
