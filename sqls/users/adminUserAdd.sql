IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'adminUserAdd')
	BEGIN
  DROP  Procedure  adminUserAdd
END
GO

CREATE PROCEDURE [dbo].adminUserAdd(
  @email varchar(50),
  @firstName varchar(100),
  @lastName varchar(100),
  @displayName varchar(200),
  @provider varchar(50),
  @googleId varchar(50),
  @profileImageUrl varchar(512) = '',
  @providerData varchar(MAX) = '',
  @userId int output
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

  COMMIT TRANSACTION
END
GO
GRANT EXEC ON [dbo].adminUserAdd TO rpb_role
GO