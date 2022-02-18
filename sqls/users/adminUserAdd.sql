IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'adminUserAdd')
	BEGIN
  DROP  Procedure  adminUserAdd
END
GO

CREATE PROCEDURE [dbo].adminUserAdd(
  @email          VARCHAR(50),
  @firstName      VARCHAR(100),
  @lastName       VARCHAR(100),
  @displayName    VARCHAR(200),
  @provider       VARCHAR(50),
  @googleId       VARCHAR(50),
  @roles		      VARCHAR(50) = NULL,
  @profileImageUrl VARCHAR(512) = '',
  @providerData   VARCHAR(MAX) = '',
  @userId         INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON

  BEGIN TRANSACTION

  INSERT INTO [User]
    (email, firstName, lastName, displayName, [provider], googleId, profileImageUrl, providerData)
  VALUES
    (@email, @firstName, @lastName, @displayName, @provider, @googleId, @profileImageUrl, @providerData)

  IF @@ERROR <> 0
  BEGIN
    ROLLBACK TRANSACTION
    RETURN -1
  END

  SET @userId = SCOPE_IDENTITY()

  IF LEN(ISNULL(@roles, '')) > 0
  BEGIN
    INSERT INTO UserRoles
      (userId, roleId)
    SELECT @userId, CAST(Value AS INT)
    FROM STRING_SPLIT(@roles, ',')
    WHERE LEN(Value) > 0

    IF @@ERROR <> 0
    BEGIN
      ROLLBACK TRANSACTION
      RETURN -2
    END
  END

  COMMIT TRANSACTION
END
GO
GRANT EXEC ON [dbo].adminUserAdd TO rpb_role
GO