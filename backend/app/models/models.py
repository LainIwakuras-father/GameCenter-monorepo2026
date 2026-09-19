from tortoise import fields
from tortoise.models import Model
from tortoise.validators import MaxValueValidator, MinValueValidator


class BaseModel(Model):
    id = fields.IntField(primary_key=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        abstract = True


class User(BaseModel):
    username = fields.CharField(max_length=150, unique=True)
    email = fields.CharField(max_length=255, unique=True, null=True)
    hash_password = fields.CharField(max_length=128)

    first_name = fields.CharField(max_length=30, null=True)
    last_name = fields.CharField(max_length=150, null=True)

    is_active = fields.BooleanField(default=True)
    is_superuser = fields.BooleanField(default=False)

    class Meta:
        table = "users"

    def __str__(self):
        return self.username


class Curator(BaseModel):
    station = fields.ForeignKeyField("models.Station", null=True)
    user = fields.OneToOneField("models.User", related_name="curator")

    name = fields.CharField(max_length=100, null=True)

    class Meta:
        table = "curators"

    def __str__(self):
        return self.name or f"Curator {self.id}"


class PlayerTeam(BaseModel):
    user = fields.OneToOneField("models.User", related_name="player_team")
    team_name = fields.CharField(max_length=100)
    score = fields.IntField(default=0)
    stations = fields.ForeignKeyField("models.StationOrder")
    # stations = fields.ForeignKeyField("models.StationOrder", null=True) # надо будет потом поменять на False и сделать миграцию  но это пока долго
    # A one-based route position; 11 means that all ten stations are done.
    current_station = fields.IntField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(11)],
    )

    class Meta:
        table = "player_teams"

    def __str__(self):
        return self.team_name


class StationOrder(BaseModel):
    first = fields.ForeignKeyField(
        "models.Station", related_name="first_orders", null=True
    )
    second = fields.ForeignKeyField(
        "models.Station", related_name="second_orders", null=True
    )
    third = fields.ForeignKeyField(
        "models.Station", related_name="third_orders", null=True
    )
    fourth = fields.ForeignKeyField(
        "models.Station", related_name="fourth_orders", null=True
    )
    fifth = fields.ForeignKeyField(
        "models.Station", related_name="fifth_orders", null=True
    )
    sixth = fields.ForeignKeyField(
        "models.Station", related_name="sixth_orders", null=True
    )
    seventh = fields.ForeignKeyField(
        "models.Station", related_name="seventh_orders", null=True
    )
    eighth = fields.ForeignKeyField(
        "models.Station", related_name="eighth_orders", null=True
    )
    ninth = fields.ForeignKeyField(
        "models.Station", related_name="ninth_orders", null=True
    )
    tenth = fields.ForeignKeyField(
        "models.Station", related_name="tenth_orders", null=True
    )

    class Meta:
        table = "station_orders"

    def __str__(self):
        return str(self.id)


class Station(BaseModel):
    # Station duration is stored in whole minutes.
    time = fields.IntField(default=10)
    points = fields.IntField(default=10)
    name = fields.CharField(max_length=100)
    description = fields.TextField(null=True)
    image = fields.CharField(max_length=500, null=True)
    assignment = fields.TextField(null=True)

    task = fields.ForeignKeyField("models.Task", null=True)

    class Meta:
        table = "stations"

    def __str__(self):
        return self.name or f"Task {self.id}"


class Task(BaseModel):
    name = fields.CharField(max_length=100, null=True)
    question = fields.TextField(null=True)
    answer = fields.TextField(null=True)

    class Meta:
        table = "tasks"

    def __str__(self):
        return self.name or f"Task {self.id}"
