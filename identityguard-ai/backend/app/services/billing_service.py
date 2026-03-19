def upgrade_to_pro(user):
    user.plan = "pro"
    return {"message": "Upgraded to Pro"}
