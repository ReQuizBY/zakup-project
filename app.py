from flask import Flask, render_template, request, redirect, url_for, session, g, jsonify
import os
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_principal import Principal, Permission, RoleNeed, UserNeed, identity_loaded, identity_changed, Identity, AnonymousIdentity
from flask_bcrypt import Bcrypt
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, fields
from wtforms.validators import DataRequired, EqualTo, Length
from flask_sqlalchemy import SQLAlchemy  # Import SQLAlchemy
from flask_admin import Admin, BaseView, expose  # Import Flask-Admin
from flask_admin.contrib.sqla import ModelView  # Import ModelView
import babel
from babel import Locale
from flask_admin.menu import MenuLink

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or os.urandom(24)

# Настройка SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Use SQLite
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable tracking modifications
app.config['BABEL_DEFAULT_LOCALE'] = 'ru'  # Default locale
db = SQLAlchemy(app)

# Flask-Bcrypt setup
bcrypt = Bcrypt(app)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Flask-Principal setup
principals = Principal(app)

# Define roles
admin_permission = Permission(RoleNeed('admin'))
economist_permission = Permission(RoleNeed('economist'))
purchase_permission = Permission(RoleNeed('purchase'))
lawyer_permission = Permission(RoleNeed('lawyer'))
accountant_permission = Permission(RoleNeed('accountant'))


# Define User model for SQLAlchemy
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='user')

    def __repr__(self):
        return f'<User {self.username}>'

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)


# Define Application model for SQLAlchemy
class Application(db.Model):
    id = db.Column(db.String(255), primary_key=True)
    reg_day = db.Column(db.Integer, nullable=False)
    reg_month = db.Column(db.Integer, nullable=False)
    reg_year = db.Column(db.Integer, nullable=False)
    outgoing_id = db.Column(db.String(255), nullable=False)
    outgoing_day = db.Column(db.Integer, nullable=False)
    outgoing_month = db.Column(db.Integer, nullable=False)
    outgoing_year = db.Column(db.Integer, nullable=False)
    company_name = db.Column(db.String(255), nullable=False)
    purchase_subject = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    economist_info = db.Column(db.Text, default='')
    purchase_info = db.Column(db.Text, default='')
    exec_docs_info = db.Column(db.Text, default='')
    lawyer_info = db.Column(db.Text, default='')
    accountant_info = db.Column(db.Text, default='')
    economist_status = db.Column(db.String(50), default='empty')
    purchase_status = db.Column(db.String(50), default='empty')
    exec_docs_status = db.Column(db.String(50), default='')
    lawyer_status = db.Column(db.String(50), default='empty')
    accountant_status = db.Column(db.String(50), default='')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # Foreign key to User

    def __repr__(self):
        return f'<Application {self.id}>'


# User loader callback (required by Flask-Login)
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Flask-Principal identity loader
@identity_loaded.connect_via(app)
def on_identity_loaded(sender, identity):
    # Set the identity user object
    identity.user = current_user

    # Add the UserNeed to the identity
    if hasattr(current_user, 'id'):
        identity.provides.add(UserNeed(current_user.id))

        # Add the RoleNeeds to the identity
        if hasattr(current_user, 'role'):
            identity.provides.add(RoleNeed(current_user.role))


# Define Registration Form
class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    role = SelectField('Role', choices=[('user', 'User'), ('economist', 'Economist'), ('purchase', 'Purchase'),
                                        ('lawyer', 'Lawyer'), ('accountant', 'Accountant'), ('admin', 'Admin')],
                      default='user')
    submit = SubmitField('Register')


# Define Login Form
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')


@app.route('/register', methods=['GET', 'POST'])
@login_required  # Only logged in users can register
@admin_permission.require(http_exception=403)  # Only admins can register other accounts
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        role = form.role.data
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        try:
            user = User(username=username, password=hashed_password, role=role)
            db.session.add(user)
            db.session.commit()
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            form.username.errors.append('Username already taken.')
            return render_template('register.html', form=form)
    return render_template('register.html', form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        user = User.query.filter_by(username=username).first()  # Query Using SQLAlchemy

        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)

            # Flask-Principal: Signal that the identity has changed
            identity_changed.send(app, identity=Identity(user.id))

            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            form.password.errors.append('Invalid username or password')
            return render_template('login.html', form=form)
    return render_template('login.html', form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()

    # Remove session keys that Flask-Principal uses
    for key in ('identity.id', 'identity.auth_type'):
        session.pop(key, None)

    # Tell Flask-Principal the user is anonymous
    identity_changed.send(app, identity=AnonymousIdentity())
    return redirect(url_for('login'))


@app.route('/')
@login_required
def index():
    applications = get_applications()
    return render_template('index.html', applications=applications)


# Modify add_application_to_db function
def add_application_to_db(data):
    try:
        new_application = Application(
            id=data['id'], reg_day=data['reg_day'], reg_month=data['reg_month'],
            reg_year=data['reg_year'], outgoing_id=data['outgoing_id'], outgoing_day=data['outgoing_day'],
            outgoing_month=data['outgoing_month'], outgoing_year=data['outgoing_year'],
            company_name=data['company_name'], purchase_subject=data['purchase_subject'], amount=data['amount'],
            user_id=current_user.id  # Add the current user's ID
        )
        db.session.add(new_application)
        db.session.commit()
        return True
    except Exception as e:
        print(f"Ошибка при добавлении заявки: {e}")
        db.session.rollback()
        return False


def get_applications():
    try:
        # Modify the SQL query to filter applications by user_id
        applications = Application.query.filter_by(user_id=current_user.id).all()
        return applications
    except Exception as e:
        print(f"Database error: {e}")
        return []


# Create admin views
class MyModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('login', next=request.url))

class UserModelView(MyModelView):
    column_list = ('username', 'role')
    form_base_class = FlaskForm  # Specify the base form class
    form_overrides = dict(
        username=StringField,
        role=SelectField,  # Specify the field class
    )
    form_args = dict(
        username=dict(label='Username', validators=[DataRequired(), Length(min=4, max=20)]),
        role=dict(label='Role', choices=[('user', 'User'), ('economist', 'Economist'), ('purchase', 'Purchase'),
                                         ('lawyer', 'Lawyer'), ('accountant', 'Accountant'), ('admin', 'Admin')],
                  default='user')
    )
    form_columns = ('username', 'role')

class ApplicationModelView(MyModelView):
    column_list = ('id', 'company_name', 'purchase_subject', 'user_id')


# Create index view class which extends BaseView
class MyHomeView(BaseView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.endpoint = 'myhomeview'

    @expose('/')
    def index(self):
        return self.render('admin/my_index.html')


    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('login', next=request.url))

class AuthenticatedMenuLink(MenuLink):
    def is_accessible(self):
        return current_user.is_authenticated


# Initialize Flask-Admin
admin = Admin(app, name='Admin Panel', template_mode='bootstrap3', base_template='admin/my_base.html')

# Add admin views
admin.add_view(UserModelView(User, db.session))
admin.add_view(ApplicationModelView(Application, db.session))

# Add menu links
admin.add_link(AuthenticatedMenuLink(name='Logout', url='/logout'))

# Localization support
@app.before_request
def before_request():
    g.locale = str(get_locale())


@app.context_processor
def inject_locales():
    return {'locales': get_all_locales()}


def get_locale():
    try:
        session_locale = session['locale']
    except KeyError:
        session_locale = request.accept_languages.best_match(get_all_locales())
    return Locale.parse(session_locale)


def get_all_locales():
    return ['en', 'ru']


@app.route('/set_locale/<locale>')
def set_locale(locale):
    session['locale'] = locale
    return redirect(request.referrer)

# Add new application
@app.route('/add_application', methods=['POST'])
@login_required
def add_application():
    data = request.form  # Get data from the form
    try:
        new_application = Application(
            id=data['id'], reg_day=data['reg_day'], reg_month=data['reg_month'],
            reg_year=data['reg_year'], outgoing_id=data['outgoing_id'], outgoing_day=data['outgoing_day'],
            outgoing_month=data['outgoing_month'], outgoing_year=data['outgoing_year'],
            company_name=data['company_name'], purchase_subject=data['purchase_subject'], amount=data['amount'],
            user_id=current_user.id  # Add the current user's ID
        )
        db.session.add(new_application)
        db.session.commit()
        return redirect(url_for('index'))  # Redirect to the index page
    except Exception as e:
        print(f"Ошибка при добавлении заявки: {e}")
        db.session.rollback()
        return "Ошибка при добавлении заявки", 500  # Return an error message

#New code
#Update APplication
@app.route('/update/<app_id>', methods=['POST'])
@login_required
def update_application(app_id):
    data = request.get_json()
    column = data.get('column')

    try:
        # Check if the current user owns the application
        application = Application.query.filter_by(id=app_id, user_id=current_user.id).first()

        if not application and current_user.role != 'admin':
            return jsonify({"status": "error", "message": "You do not have permission to edit this application"}), 403

        # Update the application
        setattr(application, column, data['value'])
        db.session.commit()

        return jsonify({"status": "success"}), 200

    except Exception as e:
        print(f"Ошибка при обновлении заявки: {e}")
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

#Delete Application
@app.route('/delete/<app_id>', methods=['POST'])
@login_required
def delete_application(app_id):
    try:
        # Check if the current user owns the application
        application = Application.query.filter_by(id=app_id, user_id=current_user.id).first()

        if not application and current_user.role != 'admin':
            return jsonify({"status": "error", "message": "You do not have permission to delete this application"}), 403

        db.session.delete(application)
        db.session.commit()

        return jsonify({"status": "success"}), 200

    except Exception as e:
        print(f"Ошибка при удалении заявки: {e}")
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# Ensure the DB Exists
def create_database():
    with app.app_context():
        db.create_all()


# Add this to create default user on first launch or after reset
def create_default_user():
    with app.app_context():
        user = User.query.filter_by(username="admin").first()
        if not user:
            hashed_password = bcrypt.generate_password_hash("admin").decode('utf-8')
            new_admin = User(username="admin", password=hashed_password, role="admin")
            db.session.add(new_admin)
            db.session.commit()
            print("Default admin user created: admin/admin")


# Run the app
if __name__ == '__main__':
    with app.app_context():
        create_database()
        create_default_user()
    app.run(host='0.0.0.0', debug=True)