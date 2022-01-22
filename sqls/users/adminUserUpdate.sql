IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'adminUserUpdate')
	BEGIN
  DROP  Procedure  adminUserUpdate
END
GO

CREATE PROCEDURE [dbo].adminUserUpdate(
  @id					  INT,
  @firstName		NVARCHAR(100),
  @lastName			NVARCHAR(100),
  @displayName	NVARCHAR(200),
  @phone        VARCHAR(50),
  @status       TINYINT = 1,
  @roles		    VARCHAR(MAX) = '',
  @socialInfo   VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  BEGIN TRANSACTION

  UPDATE	[dbo].[User]
	SET	firstName = @firstName,
			lastName = @lastName,
			displayName = @displayName,
      phone = @phone,
      socialInfo = @socialInfo,
      [status] = @status,
			updated = GETDATE()
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    ROLLBACK TRANSACTION
    RETURN -1
  END

  DELETE FROM UserRoles WHERE userId = @id

  IF @@ERROR <> 0
  BEGIN
    ROLLBACK TRANSACTION
    RETURN -2
  END

  INSERT INTO UserRoles
    (userId, roleId)
  SELECT @id, CAST(Value AS INT)
  FROM STRING_SPLIT(@roles, ',')
  WHERE LEN(Value) > 0

  IF @@ERROR <> 0
  BEGIN
    ROLLBACK TRANSACTION
    RETURN -3
  END

  COMMIT TRANSACTION
END
GO
GRANT EXEC ON [dbo].adminUserUpdate TO rpb_role
GO