import pytest
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, get_db


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            yield client


@pytest.fixture
def setup_database():
    with app.app_context():
        db = get_db()
        db.execute('DELETE FROM todos')
        db.execute('DELETE FROM users WHERE username != "admin"')
        db.commit()
        yield
        db.execute('DELETE FROM todos')
        db.execute('DELETE FROM users WHERE username != "admin"')
        db.commit()


def test_register_user(client, setup_database):
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'User registered successfully'
    assert data['user']['username'] == 'testuser'
    assert data['user']['email'] == 'test@example.com'
    assert 'token' in data


def test_register_existing_user(client, setup_database):
    client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    assert response.status_code == 409


def test_login_user(client, setup_database):
    client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'testuser',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Login successful'
    assert data['user']['username'] == 'testuser'
    assert 'token' in data


def test_login_invalid_credentials(client):
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }),
        content_type='application/json'
    )
    assert response.status_code == 401


def test_create_todo(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    response = client.post(
        '/api/todos',
        data=json.dumps({
            'title': 'Test Todo',
            'description': 'This is a test todo',
            'priority': 2,
            'category': '工作'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Test Todo'
    assert data['description'] == 'This is a test todo'
    assert data['priority'] == 2
    assert data['category'] == '工作'


def test_get_todos(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    client.post(
        '/api/todos',
        data=json.dumps({
            'title': 'Test Todo',
            'description': 'This is a test todo',
            'priority': 2,
            'category': '工作'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    response = client.get(
        '/api/todos',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]['title'] == 'Test Todo'


def test_update_todo(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    create_response = client.post(
        '/api/todos',
        data=json.dumps({
            'title': 'Test Todo',
            'description': 'This is a test todo',
            'priority': 2,
            'category': '工作'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    todo_id = json.loads(create_response.data)['id']
    
    response = client.put(
        f'/api/todos/{todo_id}',
        data=json.dumps({
            'title': 'Updated Todo',
            'completed': 1
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Updated Todo'
    assert data['completed'] == 1


def test_delete_todo(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    create_response = client.post(
        '/api/todos',
        data=json.dumps({
            'title': 'Test Todo',
            'description': 'This is a test todo',
            'priority': 2,
            'category': '工作'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    todo_id = json.loads(create_response.data)['id']
    
    response = client.delete(
        f'/api/todos/{todo_id}',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Todo deleted successfully'


def test_toggle_complete(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    create_response = client.post(
        '/api/todos',
        data=json.dumps({
            'title': 'Test Todo',
            'description': 'This is a test todo',
            'priority': 2,
            'category': '工作'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    todo_id = json.loads(create_response.data)['id']
    
    response = client.post(
        f'/api/todos/{todo_id}/complete',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['completed'] == 1


def test_get_current_user(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    response = client.get(
        '/api/auth/me',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['username'] == 'testuser'
    assert data['email'] == 'test@example.com'


def test_update_profile(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    response = client.put(
        '/api/users/profile',
        data=json.dumps({
            'username': 'updateduser',
            'email': 'updated@example.com'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['username'] == 'updateduser'
    assert data['email'] == 'updated@example.com'


def test_change_password(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    response = client.post(
        '/api/users/change-password',
        data=json.dumps({
            'current_password': 'password123',
            'new_password': 'newpassword456'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Password changed successfully'


def test_get_templates(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    response = client.get(
        '/api/templates',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'daily_report' in data
    assert 'weekly_report' in data
    assert 'habit_tracker' in data
    assert 'meeting_notes' in data


def test_apply_template(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    response = client.post(
        '/api/templates/daily_report/apply',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['created_count'] == 4
    assert data['template_name'] == '日报模板'


def test_share_todo(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    create_response = client.post(
        '/api/todos',
        data=json.dumps({
            'title': 'Test Todo',
            'description': 'This is a test todo',
            'priority': 2,
            'category': '工作'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    todo_id = json.loads(create_response.data)['id']
    
    response = client.post(
        f'/api/todos/{todo_id}/share',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'share_url' in data
    assert 'share_token' in data
    assert data['expires_in'] == 86400


def test_get_shared_todo(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    create_response = client.post(
        '/api/todos',
        data=json.dumps({
            'title': 'Test Todo',
            'description': 'This is a test todo',
            'priority': 2,
            'category': '工作'
        }),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    todo_id = json.loads(create_response.data)['id']
    
    share_response = client.post(
        f'/api/todos/{todo_id}/share',
        headers={'Authorization': f'Bearer {token}'}
    )
    share_token = json.loads(share_response.data)['share_token']
    
    response = client.get(f'/api/share/{share_token}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Test Todo'
    assert data['description'] == 'This is a test todo'


def test_get_user_stats(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    response = client.get(
        '/api/users/stats',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'total_todos' in data
    assert 'completed_todos' in data
    assert 'pending_todos' in data
    assert 'completion_rate' in data


def test_unauthorized_access(client):
    response = client.get('/api/todos')
    assert response.status_code == 401


def test_invalid_token(client):
    response = client.get(
        '/api/todos',
        headers={'Authorization': 'Bearer invalid-token'}
    )
    assert response.status_code == 401


def test_admin_access(client):
    login_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'username': 'admin',
            'password': 'admin123'
        }),
        content_type='application/json'
    )
    token = json.loads(login_response.data)['token']
    
    response = client.get(
        '/api/admin/stats',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200


def test_non_admin_cannot_access_admin_endpoints(client, setup_database):
    register_response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }),
        content_type='application/json'
    )
    token = json.loads(register_response.data)['token']
    
    response = client.get(
        '/api/admin/stats',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 403


if __name__ == '__main__':
    pytest.main([__file__, '-v'])